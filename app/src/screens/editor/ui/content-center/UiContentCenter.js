import { Listener } from "../../../../common/model/Observable.js";
import { data, EditorData } from "../../model/data.js";
import { UiPageCanvas } from "../UiPageCanvas.js";
import { ObservableArray } from "../../../../common/model/ObservableArray.js";
import { cloneDomTemplate, MouseButtonCodes } from "../../../../common/ui/dom-utils.js";
import { Comment } from "../../../../common/model/Comment.js";
import { EditorSelTracker } from "../../model/EditorSelTracker.js";
import { VersionComment } from "../../../../common/model/VersionComment.js";
import { EditorCommentEditing } from "../../model/EditorCommentEditing.js";
import { UiScrollbar } from "../../../../common/ui/UiScrollbar.js";
import { UiTextLayer } from "./UiTextLayer.js";
import { UiMarkerLayer } from "./UiMarkerLayer.js";
import { UiCanvasLayer } from "./UiCanvasLayer.js";
import { UiViewportScrollbar } from "./UiViewportScrollbar.js";
import { UiPageRectTracker } from "./UiPageRectTracker.js";
import { unused } from "../../../../common/utils.js";
import { EditorViewingArea } from "../../model/ViewingArea.js";

class UiContentCenterState {
    constructor(pageRectTracker) {
        this.pageRectTracker = pageRectTracker;
        this.nextState = null;
    }

    changeToState(nextState) {
        this.nextState = nextState;
    }

    // Override those to handle the events.
    onMouseDown(e) {
        unused(e);
    }

    onMouseUp(e) { 
        unused(e);
    }

    onMouseMotion(e) {
        unused(e);
    }

    onWheel(e) {
        unused(e);
    }
}

function translateRect(rect, xOffset, yOffset) {
    rect.left   += xOffset;
    rect.right  += xOffset;
    rect.top    += yOffset;
    rect.bottom += yOffset;
}

function scaleRect(rect, factor) {
    rect.left   *= factor;
    rect.right  *= factor;
    rect.top    *= factor;
    rect.bottom *= factor;
}

class UiContentCenterPanningState extends UiContentCenterState {
    onMouseUp(e) {
        if (e.button === MouseButtonCodes.MIDDLE) {
            this.changeToState(new UiContentCenterMainState(this.pageRectTracker));
        }
    }

    onMouseMotion(e) {
        let pageRect = this.pageRectTracker.computePageRect();
        translateRect(pageRect, e.movementX, e.movementY);
        this.pageRectTracker.setPageRect(pageRect);
    }
}

class UiContentCenterMainState extends UiContentCenterState {
    onMouseDown(e) {
        switch (e.button) {
            // Start panning.
            case MouseButtonCodes.MIDDLE: {
                this.changeToState(new UiContentCenterPanningState(this.pageRectTracker));
            } break;

            // Add a comment marker.
            case MouseButtonCodes.LEFT: {
                let [viewportX, viewportY] = this.pageRectTracker.clientToViewportCoords(e.clientX, e.clientY);
                let pageRect = this.pageRectTracker.computePageRect();

                let pageX = (viewportX - pageRect.left) / (pageRect.right - pageRect.left);
                let pageY = (viewportY - pageRect.top) / (pageRect.bottom - pageRect.top);

                if (data.commentEditing.isEditing()) {
                    data.commentEditing.editedVersionComment.setPagePos(pageX, pageY);
                } else {
                    let comment = new VersionComment(data.selTracker.version, data.selTracker.activePageNo, new Comment("", ""), pageX, pageY);
                    data.commentEditing.startEditingComment(comment);
                }
            } break;

            default: break;
        }
    }

    onWheel(e) {
        if (e.ctrlKey) {
            // For some reason, a single scroll step has e.deltaY = 102 (Windows 10).
            // TODO: Does this depend on the OS?
            let normalizedDelta = e.deltaY / 102;
            let factor = Math.pow(1.3, -normalizedDelta);

            let pageRect = this.pageRectTracker.computePageRect();
            let [viewportMouseX, viewportMouseY] = this.pageRectTracker.clientToViewportCoords(e.clientX, e.clientY);

            translateRect(pageRect, -viewportMouseX, -viewportMouseY);
            scaleRect(pageRect, factor);
            translateRect(pageRect, viewportMouseX, viewportMouseY);
            this.pageRectTracker.setPageRect(pageRect);

            let zoom = data.viewingArea.zoom;

            data.viewingArea.setZoom(zoom);
        }

        // Prevent the browser from resizing the page when Ctrl is pressed.
        e.preventDefault();
    }
}

// The PDF-viewer proper. We only display a single page for now.
// PDFJS renders into a canvas, however this alone does not allow for selecting
// text. We therefore construct a rough facsimile (the "text layer") of the PDF in the DOM.
// PDFJS does this for us. This facsimile is positioned atop the canvas. The text is all there,
// but we make it transparent. A good way to understand how this works is to using element inspection
// in your web browser.
class UiContentCenter {
    constructor(screen) {
        this.pageRectTracker = new UiPageRectTracker(screen);

        this.canvasLayer = new UiCanvasLayer(screen, this.pageRectTracker);
        this.markerLayer = new UiMarkerLayer(screen, this.pageRectTracker);
        this.textLayer = new UiTextLayer(screen, this.pageRectTracker);

        this.listener = new Listener();

        this.scrollbarX = new UiViewportScrollbar(screen, this.pageRectTracker, "x");
        this.scrollbarY = new UiViewportScrollbar(screen, this.pageRectTracker, "y");

        this.viewportEl = this.pageRectTracker.viewportEl;
        this.viewportEl.addEventListener("mousedown", e => this.onMouseDown(e));
        this.viewportEl.addEventListener("mouseup", e => this.onMouseUp(e));
        this.viewportEl.addEventListener("wheel", e => this.onWheel(e));
        this.viewportEl.addEventListener("click", e => this.onPageCanvasClicked(e));
        this.viewportEl.addEventListener("mousemove", e => this.onMouseMotion(e));

        this.state = new UiContentCenterMainState(this.pageRectTracker);
    }

    terminate() {
        this.listener.terminate();
        this.textLayer.terminate();
        this.markerLayer.terminate();
        this.canvasLayer.terminate();
        this.scrollbarX.terminate();
        this.scrollbarY.terminate();
    }

    pollStateChange() {
        if (this.state.nextState) {
            this.state = this.state.nextState;
        }
    }

    onMouseDown(e) {
        this.state.onMouseDown(e);
        this.pollStateChange();
    }

    onMouseUp(e) {
        this.state.onMouseUp(e);
        this.pollStateChange();
    }

    onWheel(e) {
        this.state.onWheel(e);
        this.pollStateChange();
    }

    onMouseMotion(e) {
        this.state.onMouseMotion(e);
        this.pollStateChange();
    }

    onPageCanvasClicked(e) {
    }
}

export { UiContentCenter };
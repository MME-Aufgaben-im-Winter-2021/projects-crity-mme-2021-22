import { Listener } from "../../../../common/model/Observable.js";
import { data } from "../../model/data.js";
import { Comment } from "../../../../common/model/Comment.js";
import { VersionComment } from "../../../../common/model/VersionComment.js";
import { UiTextLayer } from "./UiTextLayer.js";
import { UiMarkerLayer } from "./UiMarkerLayer.js";
import { UiCanvasLayer } from "./UiCanvasLayer.js";
import { UiViewportScrollbar } from "./UiViewportScrollbar.js";
import { UiPageRectTracker } from "./UiPageRectTracker.js";
import { clamped, unused } from "../../../../common/utils.js";
import { MouseButtonCodes } from "../../../../common/ui/dom-utils.js";

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

    onMouseLeave(e) {
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

    onMouseLeave(e) {
        unused(e);
        this.changeToState(new UiContentCenterMainState(this.pageRectTracker));
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
                let viewportX, viewportY, pageRect, pageX, pageY;

                [viewportX, viewportY] = this.pageRectTracker.clientToViewportCoords(e.clientX, e.clientY);
                pageRect = this.pageRectTracker.computePageRect();

                pageX = (viewportX - pageRect.left) / (pageRect.right - pageRect.left);
                pageY = (viewportY - pageRect.top) / (pageRect.bottom - pageRect.top);

                pageX = clamped(pageX, 0.0, 1.0);
                pageY = clamped(pageY, 0.0, 1.0);

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

    static ZOOM_STEP = 1.3;
    static ZOOM_MIN = Math.pow(UiContentCenterMainState.ZOOM_STEP, -8);
    static ZOOM_MAX = Math.pow(UiContentCenterMainState.ZOOM_STEP, +8);
    onWheel(e) {
        let normalizedDelta, factor, pageRect, viewportMouseX, viewportMouseY;

        // For some reason, a single scroll step has e.deltaY = 102 (Windows 10).
        // TODO: Does this depend on the OS?
        normalizedDelta = e.deltaY / 102;
        factor = Math.pow(UiContentCenterMainState.ZOOM_STEP, -normalizedDelta);
        factor = clamped(
            factor,
            UiContentCenterMainState.ZOOM_MIN / data.viewingArea.zoom,
            UiContentCenterMainState.ZOOM_MAX / data.viewingArea.zoom);

        pageRect = this.pageRectTracker.computePageRect();
        [viewportMouseX, viewportMouseY] = this.pageRectTracker.clientToViewportCoords(e.clientX, e.clientY);

        translateRect(pageRect, -viewportMouseX, -viewportMouseY);
        scaleRect(pageRect, factor);
        translateRect(pageRect, viewportMouseX, viewportMouseY);
        this.pageRectTracker.setPageRect(pageRect);

        // Prevent the browser from resizing the page when Ctrl is pressed.
        if (e.ctrlKey) {
            e.preventDefault();
        }
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
        this.wireUpViewportEvent("mousedown", "onMouseDown");
        this.wireUpViewportEvent("mouseup", "onMouseUp");
        this.wireUpViewportEvent("wheel", "onWheel");
        this.wireUpViewportEvent("mousemove", "onMouseMotion");
        this.wireUpViewportEvent("mouseleave", "onMouseLeave");

        this.state = new UiContentCenterMainState(this.pageRectTracker);
    }

    terminate() {
        this.listener.terminate();
        this.textLayer.terminate();
        this.markerLayer.terminate();
        this.canvasLayer.terminate();
        this.scrollbarX.terminate();
        this.scrollbarY.terminate();
        this.pageRectTracker.terminate();
    }

    pollStateChange() {
        if (this.state.nextState) {
            this.state = this.state.nextState;
        }
    }

    wireUpViewportEvent(jsEventName, handlerFuncName) {
        this.viewportEl.addEventListener(jsEventName, e => {
            this.state[handlerFuncName](e);
            this.pollStateChange();
        });
    }
}

export { UiContentCenter };
import { Listener } from "../../../../common/model/Observable.js";
import { data } from "../../model/data.js";
import { Comment } from "../../../../common/model/Comment.js";
import { VersionComment } from "../../../../common/model/VersionComment.js";
import { UiTextLayer } from "./UiTextLayer.js";
import { UiMarkerLayer } from "./UiMarkerLayer.js";
import { UiCanvasLayer } from "./UiCanvasLayer.js";
import { UiContentCenterScrollbar } from "./UiContainerScrollbar.js";
import { UiPageRectTracker } from "./UiPageRectTracker.js";
import { clamped, lerp, unused } from "../../../../common/utils.js";
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
    rect.left += xOffset;
    rect.right += xOffset;
    rect.top += yOffset;
    rect.bottom += yOffset;
}

function scaleRect(rect, factor, xPivot, yPivot) {
    rect.left = lerp(xPivot, rect.left, factor);
    rect.right = lerp(xPivot, rect.right, factor);
    rect.top = lerp(yPivot, rect.top, factor);
    rect.bottom = lerp(yPivot, rect.bottom, factor);
}

class UiContentCenterPanningState extends UiContentCenterState {
    onMouseUp(e) {
        if (e.button === MouseButtonCodes.MIDDLE) {
            this.changeToState(new UiContentCenterIdleState(this.pageRectTracker));
        }
    }

    onMouseLeave(e) {
        unused(e);
        this.changeToState(new UiContentCenterIdleState(this.pageRectTracker));
    }

    onMouseMotion(e) {
        let pageRect = this.pageRectTracker.computePageRect();
        translateRect(pageRect, e.movementX, e.movementY);
        this.pageRectTracker.setPageRect(pageRect);
    }
}

class UiContentCenterIdleState extends UiContentCenterState {
    onMouseDown(e) {
        switch (e.button) {
            // Start panning.
            case MouseButtonCodes.MIDDLE: {
                this.changeToState(new UiContentCenterPanningState(this.pageRectTracker));
            } break;

            // Add a comment marker.
            case MouseButtonCodes.LEFT: {
                let containerX, containerY, pageRect, pageX, pageY;

                [containerX, containerY] = this.pageRectTracker.clientToContainerCoords(e.clientX, e.clientY);
                pageRect = this.pageRectTracker.computePageRect();

                pageX = (containerX - pageRect.left) / (pageRect.right - pageRect.left);
                pageY = (containerY - pageRect.top) / (pageRect.bottom - pageRect.top);

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
    static ZOOM_MIN = Math.pow(UiContentCenterIdleState.ZOOM_STEP, -8);
    static ZOOM_MAX = Math.pow(UiContentCenterIdleState.ZOOM_STEP, +8);
    onWheel(e) {
        let normalizedDelta, factor, pageRect, containerMouseX, containerMouseY;

        // For some reason, a single scroll step has e.deltaY = 102 (Windows 10).
        // TODO: Does this depend on the OS?
        normalizedDelta = e.deltaY / 102;
        factor = Math.pow(UiContentCenterIdleState.ZOOM_STEP, -normalizedDelta);
        factor = clamped(
            factor,
            UiContentCenterIdleState.ZOOM_MIN / data.viewingArea.zoom,
            UiContentCenterIdleState.ZOOM_MAX / data.viewingArea.zoom);

        pageRect = this.pageRectTracker.computePageRect();
        [containerMouseX, containerMouseY] = this.pageRectTracker.clientToContainerCoords(e.clientX, e.clientY);

        scaleRect(pageRect, factor, containerMouseX, containerMouseY);
        this.pageRectTracker.setPageRect(pageRect);

        // Prevent the browser from resizing the page when Ctrl is pressed.
        if (e.ctrlKey) {
            e.preventDefault();
        }
    }
}

// The PDF-viewer proper. We only display a single page for now.
class UiContentCenter {
    constructor(screen) {
        this.pageRectTracker = new UiPageRectTracker(screen);

        this.canvasLayer = new UiCanvasLayer(screen, this.pageRectTracker);
        this.markerLayer = new UiMarkerLayer(screen, this.pageRectTracker);
        this.textLayer = new UiTextLayer(screen, this.pageRectTracker);

        this.listener = new Listener();

        this.scrollbarX = new UiContentCenterScrollbar(screen, this.pageRectTracker, "x");
        this.scrollbarY = new UiContentCenterScrollbar(screen, this.pageRectTracker, "y");

        this.containerEl = this.pageRectTracker.containerEl;
        this.wireUpContentCenterEvent("mousedown", "onMouseDown");
        this.wireUpContentCenterEvent("mouseup", "onMouseUp");
        this.wireUpContentCenterEvent("wheel", "onWheel");
        this.wireUpContentCenterEvent("mousemove", "onMouseMotion");
        this.wireUpContentCenterEvent("mouseleave", "onMouseLeave");

        this.state = new UiContentCenterIdleState(this.pageRectTracker);
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

    wireUpContentCenterEvent(jsEventName, handlerFuncName) {
        this.containerEl.addEventListener(jsEventName, e => {
            this.state[handlerFuncName](e);
            this.pollStateChange();
        });
    }
}

export { UiContentCenter };
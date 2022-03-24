import { Observable, Event } from "../../../common/model/Observable.js";
import { clamped } from "../../../common/utils.js";

class EditorViewingArea extends Observable {
    static EVENT_CHANGED = "CHANGED";

    constructor() {
        super();

        // Properties are chosen such that we get reasonable behavior if
        // (1) we get a new page with a different aspect ratio
        // (2) the window gets resized.

        // If longerAxis is such that max(pageDims[x], pageDims[y]) = pageDims[longerAxis],
        // then zoom = pageDims[longerAxis] / containerDims[longerAxis].
        this.zoom = 0.8;

        // Relative page coordinates of the point that should end up at the center.
        this.centeredX = 0.5;
        this.centeredY = 0.5;
    }

    setZoom(zoom) {
        this.zoom = zoom;
        this.notifyAll(new Event(EditorViewingArea.EVENT_CHANGED, {}));
    }

    computePageRect(asp, containerWidth, containerHeight) {
        let pageRect, pageCenterX, pageCenterY, pageWidth, pageHeight;

        pageRect = {};

        if (asp > 1) {
            // longerAxis = x
            pageWidth = this.zoom * containerWidth;
            pageHeight = pageWidth / asp;
        } else {
            // longerAxis = y
            pageHeight = this.zoom * containerHeight;
            pageWidth = pageHeight * asp; 
        }

        pageCenterX = 0.5 * containerWidth + (0.5 - this.centeredX) * pageWidth;
        pageCenterY = 0.5 * containerHeight + (0.5 - this.centeredY) * pageHeight;

        pageRect.left = pageCenterX - 0.5 * pageWidth;
        pageRect.right = pageCenterX + 0.5 * pageWidth;
        pageRect.top = pageCenterY - 0.5 * pageHeight;
        pageRect.bottom = pageCenterY + 0.5 * pageHeight;

        return pageRect;
    }

    setPageRect(asp, containerWidth, containerHeight, pageRect) {
        let pageWidth, pageHeight, pageCenterX, pageCenterY;

        pageWidth = pageRect.right - pageRect.left;
        pageHeight = pageRect.bottom - pageRect.top;
        pageCenterX = 0.5 * (pageRect.left + pageRect.right);
        pageCenterY = 0.5 * (pageRect.top + pageRect.bottom);

        if (asp > 1) {
            // longerAxis = x
            this.zoom = pageWidth / containerWidth;
        } else {
            // longerAxis = y
            this.zoom = pageHeight / containerHeight;
        }

        this.centeredX = (-pageCenterX + 0.5 * containerWidth + 0.5 * pageWidth) / pageWidth;
        this.centeredY = (-pageCenterY + 0.5 * containerHeight + 0.5 * pageHeight) / pageHeight;

        // Kind of ugly to have this here ... But easiest way to get this working for now.
        this.clampPanning();

        this.notifyAll(new Event(EditorViewingArea.EVENT_CHANGED, {}));
    }

    clampPanning() {
        this.centeredX = clamped(this.centeredX, 0.0, 1.0);
        this.centeredY = clamped(this.centeredY, 0.0, 1.0);
    }
}

export { EditorViewingArea };
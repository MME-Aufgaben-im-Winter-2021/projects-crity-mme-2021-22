import { Observable, Event } from "../../../common/model/Observable.js";
import { clamped } from "../../../common/utils.js";

// General overview of the (quite hairy) coordinate workflow:
// All our coordinate axes are oriented according to programmer tradition, i.e.
// x points right, y points down.
// To express any point on the page or on the user's screen, we can use:
//      - Relative page coordinates. The top left of the page has coordinates (0, 0), the
//        bottom right has coordinates (1, 1)
//      - PDFJS coordinates. These are taken from what PDFJS calls the "viewport". The top left
//        of the page has coordinates (0, 0), the coordinates of the bottom right can be any
//        nonnegative pair of integers (are fractional values possible?), these are presumably
//        specified by the .pdf file. These also specify the render resolution (which is probably not ideal)
//        and the size of the canvas and text-layer DOM elements before the CSS transformations.
//      - Client coordinates. Are usage of this term (I believe) does not deviate from what the WEB specs
//        mean when they use it. The top left of the browser page has coordinates (0, 0), the bottom right
//        have coordinates according to the width and height of the full browser page.
//      - Container coordinates. Have the same scaling as client coordinates, but are offset such that
//        the "content center" (the thing that shows the PDF, without counting the scrollbars) is a rectangle
//        with top left at (0, 0), bottom left at (container width, container height).
//
// EditorViewingArea keeps parameters that tell us how to reinterpret relative page coordinates as container coordinates.
// The page rect is the page rectangle expressed in container coordinates, put differently they describe [0,1]x[0,1] square 
// in relative page coordinates as a rectangle in container coordinates. Using the page rect, you can e.g. transform relative
// page coordinates to container coordinates by lerp'ing the edges.
//
// The EditorViewingArea parameters are chosen such that they remain invariant 
// - under changes to the container coordinates, i.e. resizing the container does not require any recalculation of the parameters 
//   we store, but it does require recomputation of the page rect.
// - under changes to the page dimension, in particular to the aspect ratio of the page.
class EditorViewingArea extends Observable {
    static EVENT_CHANGED = "CHANGED";

    constructor() {
        super();

        // Properties are chosen such that we get reasonable behavior if
        // (1) we get a new page with a different aspect ratio
        // (2) the window gets resized.

        // If longerAxis is such that max(pageDims[x], pageDims[y]) = pageDims[longerAxis],
        // then zoom = pageDims[longerAxis] / containerDims[longerAxis].
        // Here, pageDims refers to the page dimensions in container coordinates, containerDims
        // refers to the container dimensions in container coordinates.
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
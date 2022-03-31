import { renderSchedule } from "./renderSchedule.js";

// All the code that is necessary for feeding the PDFJS render output into a canvas.
// Currently used for the main PDF display and the thumbnail preview.
class UiPageCanvas {
    constructor(canvasEl, priorityLevel=0) {
        this.canvasEl = canvasEl;
        this.canvasCtx = this.canvasEl.getContext("2d");

        this.priorityLevel = priorityLevel;

        this.scheduleTask = null;
    }

    terminate() {
        this.cancelPotentialRenderTask();
    }

    // This will be how big the canvas shows up in the UI.
    // Always call this before rendering, to keep the aspect ratio reasonable!
    // The PDF will be rendered at the same resolution as its canvas in the UI.
    setDimensions(width, height) {
        // Support HiDPI-screens.
        let outputScale = window.devicePixelRatio || 1;

        this.canvasEl.width = Math.floor(width * outputScale);
        this.canvasEl.height = Math.floor(height * outputScale);

        this.canvasEl.style.width = Math.floor(width) + "px";
        this.canvasEl.style.height = Math.floor(height) + "px";
    }

    /// Tells PDFJS to asynchronously draw the PDF into our canvas.
    /// @param[pdfPage] Has type PdfPage.
    renderPage(pdfPage) {
        let viewport, scaleX, scaleY;

        if (pdfPage === null) {
            return;
        }

        this.cancelPotentialRenderTask();

        viewport = pdfPage.viewport;

        // Without any transform, PDFJS will try to render in "PDFJS coordinates", i.e. the coordinate system
        // given by the viewport. Apply a scale to make the PDF fit into the canvas (which might be thumbnail).
        // An alternative solution might be to create a new viewport, but this seems nicest.
        scaleX = this.canvasEl.width / viewport.width;
        scaleY = this.canvasEl.height / viewport.height;

        this.scheduleTask = renderSchedule.createTask(pdfPage, this.priorityLevel, {
            canvasContext: this.canvasCtx,

            // Like CSS transforms; this encodes the first two rows of the 3x3 homogeneous transform in column-major
            // layout (last row can be set to 0 0 1 for affine transforms). It is applied like so:
            // transformed_x = transform[0]*x + transform[2]*y + transform[4]
            // transformed_y = transform[1]*x + transform[3]*y + transform[5]
            transform: [scaleX, 0, 0, scaleY, 0, 0],

            viewport,
        });
    }

    cancelPotentialRenderTask() {
        if (this.scheduleTask !== null) {
            renderSchedule.destroyTask(this.scheduleTask);
            this.scheduleTask = null;
        }
    }

    reprioritize(newPriorityLevel) {
        if (this.scheduleTask !== null) {
            renderSchedule.reprioritizeTask(this.scheduleTask, newPriorityLevel);
        }
    }
}

export { UiPageCanvas };
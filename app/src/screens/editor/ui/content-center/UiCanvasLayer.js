import { Listener } from "../../../../common/model/Observable.js";
import { data } from "../../model/data.js";
import { EditorSelTracker } from "../../model/EditorSelTracker.js";
import { UiPageCanvas } from "../UiPageCanvas.js";
import { UiPageRectTracker } from "./UiPageRectTracker.js";

class UiCanvasLayer {
    constructor(screen, pageRectTracker) {
        this.listener = new Listener();

        this.pageCanvas = new UiPageCanvas(screen.el.querySelector(".id-pdf-canvas"));

        this.pageRectTracker = pageRectTracker;
        this.pageRectTracker.addEventListener(UiPageRectTracker.EVENT_PAGE_RECT_CHANGED, () => this.updateTransform(), this.listener);

        data.selTracker.addEventListener(EditorSelTracker.EVENT_ACTIVE_PAGE_CHANGED, () => this.onActivePageChanged(), this.listener);
    }

    terminate() {
        this.listener.terminate();
    }

    async onActivePageChanged() {
        let activePdfPage = await data.selTracker.activePage,
            viewport = activePdfPage.viewport;

        this.pageCanvas.setDimensions(viewport.width, viewport.height);
        this.pageCanvas.renderPage(activePdfPage);
    }

    updateTransform() {
        let pageRect, scale;

        pageRect = this.pageRectTracker.computePageRect();
        this.pageCanvas.canvasEl.style.transformOrigin = "left top";

        scale = (pageRect.right - pageRect.left) / data.selTracker.activePage.viewport.width;
        this.pageCanvas.canvasEl.style.transform = `matrix(${scale}, 0, 0, ${scale}, ${pageRect.left}, ${pageRect.top})`;
    }
}

export { UiCanvasLayer };
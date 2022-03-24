import { Listener } from "../../../../common/model/Observable.js";
import { data } from "../../model/data.js";
import { EditorSelTracker } from "../../model/EditorSelTracker.js";
import pdfjsLib from "pdfjs-dist/webpack.js";
import { UiPageRectTracker } from "./UiPageRectTracker.js";

class UiTextLayer {
    constructor(screen, pageRectTracker) {
        this.textLayerEl = screen.el.querySelector(".id-pdf-text-layer");

        this.listener = new Listener();

        this.pageRectTracker = pageRectTracker;
        this.pageRectTracker.addEventListener(UiPageRectTracker.EVENT_PAGE_RECT_CHANGED, () => this.updateTransform(), this.listener);

        data.selTracker.addEventListener(EditorSelTracker.EVENT_ACTIVE_PAGE_CHANGED, () => this.onActivePageChanged(), this.listener);
    }

    terminate() {
        this.listener.terminate();
    }

    async onActivePageChanged() {
        let activePage, pdfJsPage, viewport, textContent, textDivs, textContentItemsStr, textLayerFrag;

        // TODO(optimize): Don't fetch the page everywhere.
        activePage = data.selTracker.activePage;
        pdfJsPage = activePage.pdfJsPage;
        viewport = activePage.viewport;

        this.textLayerEl.innerHTML = "";

        this.textLayerEl.style.width = Math.floor(viewport.width) + "px";
        this.textLayerEl.style.height = Math.floor(viewport.height) + "px";
    
        textContent = await pdfJsPage.getTextContent();

        // These two arrays will be populated by #renderTextLayer.
        // There seems to be a one-to-one correspondence between the elements
        // in the textDivs array and the textContentItemsStr array.
        // TODO: Does this also hold for textContent.items?
        textDivs = [];
        textContentItemsStr = [];

        // Also populated by #renderTextLayer.
        textLayerFrag = document.createDocumentFragment();

        await pdfjsLib.renderTextLayer({
            textContent: textContent,
            // TODO: Could we be benefit from a stream-based approach?
            textContentStream: null,
            container: textLayerFrag,
            viewport: viewport,
            textDivs: textDivs,
            textContentItemsStr: textContentItemsStr,
            timeout: 0,
            // TODO: Investigate what this is good for.
            enhanceTextSelection: false,
        });
    
        this.textLayerEl.appendChild(textLayerFrag);

        this.updateTransform();
    }

    updateTransform() {
        let pageRect, scale;

        pageRect = this.pageRectTracker.computePageRect();

        this.textLayerEl.style.transformOrigin = "left top";

        scale = (pageRect.right - pageRect.left) / this.textLayerEl.offsetWidth;
        this.textLayerEl.style.transform = `matrix(${scale}, 0, 0, ${scale}, ${pageRect.left}, ${pageRect.top})`;
    }
}

export { UiTextLayer };
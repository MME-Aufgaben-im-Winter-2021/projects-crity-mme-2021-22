import { Listener } from "../../../common/model/Observable.js";
import { ActivePdf } from "../model/ActivePdf.js";
import { data, EditorData } from "../model/data.js";
import { UiPageCanvas } from "./UiPageCanvas.js";
import pdfjsLib from "pdfjs-dist/webpack.js";

// The PDF-viewer proper. We only display a single page for now.
// PDFJS renders into a canvas, however this alone does not allow for selecting
// text. We therefore construct a rough facsimile (the "text layer") of the PDF in the DOM.
// PDFJS does this for us. This facsimile is positioned atop the canvas. The text is all there,
// but we make it transparent. A good way to understand how this works is to using element inspection
// in your web browser.
class UiContentCenter {
    constructor(screen) {
        this.pageCanvas = new UiPageCanvas(screen.el.querySelector(".id-pdf-canvas"));
        this.textLayerEl = screen.el.querySelector(".id-pdf-text-layer");

        this.listener = new Listener();
        data.addEventListener(EditorData.EVENT_PDF_LOADED, () => this.onPdfLoaded(), this.listener);
    }

    terminate() {
        this.listener.terminate();
    }

    // We only care about this event to be able to subscribe to the active page event.
    onPdfLoaded() {
        data.activePdf.addEventListener(ActivePdf.EVENT_ACTIVE_PAGE_CHANGED, () => this.onActivePageChanged(), this.listener);
    }

    async onActivePageChanged() {
        let activePdfPage = await data.activePdf.fetchPage(data.activePdf.activePageNo),
            pdfJsPage = activePdfPage.pdfJsPage,
            viewport = activePdfPage.viewport;

        this.pageCanvas.setDimensions(viewport.width, viewport.height);
        this.pageCanvas.renderPage(activePdfPage);

        { // Update the text layer.
            this.textLayerEl.innerHTML = "";

            this.textLayerEl.style.width = Math.floor(viewport.width) + "px";
            this.textLayerEl.style.height = Math.floor(viewport.height) + "px";
    
            let textContent = await pdfJsPage.getTextContent(),

                // These two arrays will be populated by #renderTextLayer.
                // There seems to be a one-to-one correspondence between the elements
                // in the textDivs array and the textContentItemsStr array.
                // TODO: Does this also hold for textContent.items?
                textDivs = [],
                textContentItemsStr = [],

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
        }

        // WIP, leave this here for now ... some code experiments for when we add zooming.
        //this.canvasEl.style.transformOrigin = "left top";
        //this.textLayerEl.style.transformOrigin = "left top";
        //this.canvasEl.style.transform = "scale(2.0, 2.0)";
        //this.textLayerEl.style.transform = "scale(2.0, 2.0)";
    }
}

export { UiContentCenter };
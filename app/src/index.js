import Observable from "./Observable.js";

class PdfPage extends Observable {
    constructor(pdfJsPage) {
        super();
        this.pdfJsPage = pdfJsPage;
        this.viewport = pdfJsPage.getViewport({scale: 1});
    }
}

class ActivePdf extends Observable {
    static EVENT_ACTIVE_PAGE_CHANGED = "ACTIVE_PAGE_CHANGED";

    constructor(pdfUrl, pdfJsPdf) {
        super();

        this.pdfUrl = pdfUrl;
        this.pdfJsPdf = pdfJsPdf;
        this.activePageNo = null;
    }

    async setActivePage(pageNo) {
        if (this.activePageNo === pageNo) {
            return;
        }

        this.activePageNo = pageNo;
        this.notifyAll(new Event(ActivePdf.EVENT_ACTIVE_PAGE_CHANGED, {pageNo}));
    }

    async fetchPage(pageNo) {
        let page = await this.pdfJsPdf.getPage(pageNo);
        let activePdfPage = new PdfPage(page);
        return activePdfPage;
    }
}

class Session extends Observable {
    static EVENT_PDF_LOADED = "PDF_LOADED";

    constructor() {
        super();
        this.activePdf = null;
    }

    async loadPdf(pdfUrl) {
        let loadingTask = pdfjsLib.getDocument(pdfUrl);
        let pdfJsPdf = await loadingTask.promise;
        this.activePdf = new ActivePdf(pdfUrl, pdfJsPdf);
        this.notifyAll(new Event(Session.EVENT_PDF_LOADED, {pdfUrl}));

        // TODO: Check if the PDF is empty.
        this.activePdf.setActivePage(1);
    }
}

// Having this as a global variable is arguably better than
// storing a reference to this in every class.
var session = new Session();

function cloneDomTemplate(id) {
    let weatherWidgetTemplateEl = document.querySelector(id);
    return weatherWidgetTemplateEl.content.firstElementChild.cloneNode(true);
}

class UiPageCanvas {
    constructor(canvasEl) {
        this.canvasEl = canvasEl;
        this.canvasCtx = this.canvasEl.getContext("2d");
    }

    setDimensions(width, height) {
        // Support HiDPI-screens.
        let outputScale = window.devicePixelRatio || 1;

        this.canvasEl.width = Math.floor(width * outputScale);
        this.canvasEl.height = Math.floor(height * outputScale);

        this.canvasEl.style.width = Math.floor(width) + "px";
        this.canvasEl.style.height = Math.floor(height) + "px";
    }

    async renderPage(pdfPage) {
        let viewport = pdfPage.viewport;

        let scaleX = this.canvasEl.width / viewport.width;
        let scaleY = this.canvasEl.height / viewport.height;

        await pdfPage.pdfJsPage.render({
            canvasContext: this.canvasCtx,
            transform: [scaleX, 0, 0, scaleY, 0, 0],
            viewport
        });
    }
}

class UiThumbnail {
    constructor(pageNo) {
        this.el = cloneDomTemplate("#thumbnail-template");
        this.pageNo = pageNo;

        this.el.addEventListener("click", () => this.onClick());

        let pageCanvasEl = this.el.querySelector("canvas");
        this.pageCanvas = new UiPageCanvas(pageCanvasEl);
        
        this.fetchPage();
    }

    async fetchPage() {
        let activePdfPage = await session.activePdf.fetchPage(this.pageNo);
        let viewport = activePdfPage.viewport;

        let targetSize = 200;

        // Compute width and height such that correct proportions are preserved and the longer axis has size `targetSize`.
        // There are probably more elegant ways to do this, but hopefully this is correct ;)
        // Note that at the end, width/height=asp as expected.
        let asp = viewport.width / viewport.height;
        let width, height;
        if (asp > 1) {
            width = targetSize;
            height = targetSize / asp;
        } else {
            height = targetSize;
            width = height * asp;
        }

        this.pageCanvas.setDimensions(width, height);
        this.pageCanvas.renderPage(activePdfPage);
    }

    onClick() {
        session.activePdf.setActivePage(this.pageNo);
    }
}

class UiThumbnailBar {
    constructor() {
        this.el = document.querySelector("#sidebar-left");
        session.addEventListener(Session.EVENT_PDF_LOADED, () => this.onPdfLoaded());
    }

    onPdfLoaded() {
        let numPages = session.activePdf.pdfJsPdf.numPages;

        for (let i = 0; i < numPages; i++) {
            let uiThumbnail = new UiThumbnail(i + 1);
            this.el.appendChild(uiThumbnail.el);
        }
    }
}

class UiContentCenter {
    constructor() {
        this.pageCanvas = new UiPageCanvas(document.querySelector("#pdf-canvas"));
        this.textLayerEl = document.querySelector("#pdf-text-layer");

        session.addEventListener(Session.EVENT_PDF_LOADED, () => this.onPdfLoaded());
    }

    onPdfLoaded() {
        session.activePdf.addEventListener(ActivePdf.EVENT_ACTIVE_PAGE_CHANGED, () => this.onActivePageChanged());
    }

    async onActivePageChanged() {
        let activePdfPage = await session.activePdf.fetchPage(session.activePdf.activePageNo);
        
        let pdfJsPage = activePdfPage.pdfJsPage;
        let viewport = activePdfPage.viewport;

        this.pageCanvas.setDimensions(viewport.width, viewport.height);
        this.pageCanvas.renderPage(activePdfPage);

        { // Update the text layer, TODO: Make this a function?
            this.textLayerEl.innerHTML = "";

            this.textLayerEl.style.width = Math.floor(viewport.width) + "px";
            this.textLayerEl.style.height = Math.floor(viewport.height) + "px";
    
            let textContent = await pdfJsPage.getTextContent();
            console.log(textContent);
    
            let textDivs = [];
            let textContentItemsStr = [];
    
            let textLayerFrag = document.createDocumentFragment();
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

class UserInterface {
    constructor() {
        this.thumbnailBar = new UiThumbnailBar();
        this.contentCenter = new UiContentCenter();
    }
}

function loadTestData() {
    session.loadPdf("/resources/test.pdf");
}

function init() {
    let userInterface = new UserInterface();
    loadTestData();
}

init();
import Observable from "./Observable.js";

// TODO: Chop this up into multiple files.
// TODO: Address ESlint whining.

// General code layout:
//
// We have (1) UI-independent session state (aka model, no prefix), on top of that
// we have (2) UI classes that drive the DOM (prefixed with Ui***).
//
// To keep (1) UI-agnostic, the model emits change events that the UI subscribes to.
// This obfuscates flow-control, but seems to be more inline with classic MVC.

// At the moment, this is just a thin wrapper that sits on PDFJS's PDFPageProxy
class PdfPage {
    constructor(pdfJsPage) {
        this.pdfJsPage = pdfJsPage;

        // This represents general information about page measurements.
        // We mainly use this to get the page width/height.
        this.viewport = pdfJsPage.getViewport({scale: 1});
    }
}

// Wraps PDFJS's PDFDocumentProxy.
//
// We maintain the notion of an "active" page number.
// This is the page that is visible in the viewer and where the
// comments are taken from.
//
// The first page has pageNo _1_(not 0)! This is to keep things consistent
// with PDFJS.
class ActivePdf extends Observable {
    // Events {

    // The "active" page changed. 
    // >> `pageNo`: The number of the page that _became_ active. 
    static EVENT_ACTIVE_PAGE_CHANGED = "ACTIVE_PAGE_CHANGED";

    // }

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

    // Asynchronously fetch the PdfPage corresponding to the page number.
    async fetchPage(pageNo) {
        let page = await this.pdfJsPdf.getPage(pageNo);
        let activePdfPage = new PdfPage(page);
        return activePdfPage;
    }
}

// The global object representing all the abstract state of the tab.
class Session extends Observable {
    // Events {

    // Someone set a new active PDF and it is ready for usage.
    // >> `pdfUrl`: The (shortened) URL of the PDF that was loaded.
    static EVENT_PDF_LOADED = "PDF_LOADED";

    // }

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

// IIRC, calling clone on the template directly produces a document fragment;
// this causes subtle issues when working with the fragment that are not
// very fun to debug. This method has proven more reliable thus far.
function cloneDomTemplate(id) {
    let weatherWidgetTemplateEl = document.querySelector(id);
    return weatherWidgetTemplateEl.content.firstElementChild.cloneNode(true);
}

// All the code that is necessary for feeding the PDFJS render output into a canvas.
// Currently used for the main PDF display and the thumbnail preview.
class UiPageCanvas {
    constructor(canvasEl) {
        this.canvasEl = canvasEl;
        this.canvasCtx = this.canvasEl.getContext("2d");
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
    async renderPage(pdfPage) {
        let viewport = pdfPage.viewport;

        // Without any transform, PDFJS will try to render in the coordinate system
        // given by the viewport. Apply a scale to make the PDF fit into the canvas.
        // An alternative solution might be to create a new viewport, but this seems nicest.
        let scaleX = this.canvasEl.width / viewport.width;
        let scaleY = this.canvasEl.height / viewport.height;

        await pdfPage.pdfJsPage.render({
            canvasContext: this.canvasCtx,
            
            // I think this encodes the first two rows of the 3x3 homogeneous transform in column-major
            // layout (last row can be set to 0 0 1 for affine transforms). It is applied like so:
            // transformed_x = transform[0]*x + transform[2]*y + transform[4]
            // transformed_y = transform[1]*x + transform[3]*y + transform[5]
            transform: [scaleX, 0, 0, scaleY, 0, 0],

            viewport,
        });
    }
}

/// After the function executes, the @p elements will have the CSS-class @p className if and 
/// only if @p predicate is ´true´.
function ensureCssClassPresentIff(predicate, className, ...elements) {
    elements.forEach(element => {
        if (predicate) {
            element.classList.add(className);
        } else {
            element.classList.remove(className);
        }
    });
}

// Represents the widget for a single PDF page in the thumbnail bar.
// Instantiates the DOM template for the thumbnail. The user of the class
// is responsible for linking UiThumbnail.el into the DOM tree.
class UiThumbnail {
    constructor(pageNo) {
        this.el = cloneDomTemplate("#thumbnail-template");
        this.el.addEventListener("click", () => this.onClick());

        this.pageNo = pageNo;
        this.pageNoEl = this.el.querySelector(".page-number");
        this.pageNoEl.textContent = pageNo;

        let pageCanvasEl = this.el.querySelector("canvas");
        this.pageCanvas = new UiPageCanvas(pageCanvasEl);

        session.activePdf.addEventListener(ActivePdf.EVENT_ACTIVE_PAGE_CHANGED, () => this.updateSelectionState());
        
        this.updateSelectionState();
        this._fetchPage();
    }

    // Asynchronously fill the canvas with our page.
    async _fetchPage() {
        let activePdfPage = await session.activePdf.fetchPage(this.pageNo);

        let [width, height] = this.computeDimensions(activePdfPage);
        this.pageCanvas.setDimensions(width, height);
        this.pageCanvas.renderPage(activePdfPage);
    }

    // Compute width and height such that correct proportions are preserved and the longer axis has size `TARGET_SIZE`.
    static TARGET_SIZE = 150;
    //static DBG_FORCE_ASP = 0.5;
    computeDimensions(activePdfPage) {
        // There are probably more elegant ways to do this, but hopefully this is correct ;)
        // Note that at the end, width/height=asp as expected.

        let viewport = activePdfPage.viewport;

        let asp = viewport.width / viewport.height;
        if (typeof UiThumbnail.DBG_FORCE_ASP !== "undefined") {
            asp = UiThumbnail.DBG_FORCE_ASP;
        }

        let width, height;
        if (asp > 1) {
            width = UiThumbnail.TARGET_SIZE;
            height = width / asp;
        } else {
            height = UiThumbnail.TARGET_SIZE;
            width = height * asp;
        }

        return [width, height];
    }

    updateSelectionState() {
        let isSelected = (session.activePdf.activePageNo === this.pageNo);
        ensureCssClassPresentIff(isSelected, "selected", this.el, this.pageNoEl);
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

    // Responsible for creating all the little thumbnails.
    // TODO: Remove old thumbnails once a new PDF is loaded?
    onPdfLoaded() {
        let numPages = session.activePdf.pdfJsPdf.numPages;

        for (let i = 0; i < numPages; i++) {
            let uiThumbnail = new UiThumbnail(i + 1);
            this.el.appendChild(uiThumbnail.el);
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
    constructor() {
        this.pageCanvas = new UiPageCanvas(document.querySelector("#pdf-canvas"));
        this.textLayerEl = document.querySelector("#pdf-text-layer");

        session.addEventListener(Session.EVENT_PDF_LOADED, () => this.onPdfLoaded());
    }

    // We only care about this event to be able to subscribe to the active page event.
    onPdfLoaded() {
        session.activePdf.addEventListener(ActivePdf.EVENT_ACTIVE_PAGE_CHANGED, () => this.onActivePageChanged());
    }

    async onActivePageChanged() {
        let activePdfPage = await session.activePdf.fetchPage(session.activePdf.activePageNo);
        
        let pdfJsPage = activePdfPage.pdfJsPage;
        let viewport = activePdfPage.viewport;

        this.pageCanvas.setDimensions(viewport.width, viewport.height);
        this.pageCanvas.renderPage(activePdfPage);

        { // Update the text layer`.`
            this.textLayerEl.innerHTML = "";

            this.textLayerEl.style.width = Math.floor(viewport.width) + "px";
            this.textLayerEl.style.height = Math.floor(viewport.height) + "px";
    
            let textContent = await pdfJsPage.getTextContent();
            console.log(textContent);
    
            // These two arrays will be populated by #renderTextLayer.
            // There seems to be a one-to-one correspondence between the elements
            // in the textDivs array and the textContentItemsStr array.
            // TODO: Does this also hold for textContent.items?
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

// Keep all the artificial testing stuff in one place so we know where to look
// once we have to replace it.
function loadTestData() {
    session.loadPdf("/resources/test.pdf");
}


//
// APPWRITE TESTING
//

// TODO: Keep this global?
var appwrite = new Appwrite();

async function logIn(email, password) {
    let response = await appwrite.account.createSession(email, password);
}

async function checkIfLoggedIn() {
    try {
        let response = await appwrite.account.get();
        return true;
    } catch (e) {
        return false;
    }
}

async function createPresentationVersion(presentationId, label, file) {
    let storageFile = await appwrite.storage.createFile(
        "unique()",
        file, 
        ["role:all"], 
        ["role:all"]);

    console.log("storageFile", storageFile);
        
    await appwrite.database.createDocument("presentationVersions", "unique()", {label, storageFile: storageFile.$id, presentation: presentationId});
}

async function createPresentation(title, description) {
    let presentation = await appwrite.database.createDocument("presentations", "unique()", {title, description});
    return presentation.$id;
}

async function loadLoginData() {
    appwrite
        .setEndpoint("https://appwrite.software-engineering.education/v1")
        .setProject("6206644928ab8835c77f"); // crity

    // File upload always fails without a session.
    let alreadyLoggedIn = await checkIfLoggedIn();
    if (!alreadyLoggedIn) {
        await logIn("max.mustermann@example.com", "strenggeheim");
    }

    let account = await appwrite.account.get();
    console.log(account);

    // Create dummy presentation for testing purposes.
    if (false) {
        let presentationId = await createPresentation("MME V15: Workshop", "Die allerletzte MME Präsentation?");
    
        let response = await fetch("/resources/test.pdf");
        let data = await response.blob();
        console.log(data);
        let file = new File([data], "test.pdf");
    
        await createPresentationVersion(presentationId, "V1", file);
    }
}

async function parseUrl() {
    let urlSearchParams = new URLSearchParams(window.location.search);

    let presentationId = urlSearchParams.get("presentation");
    console.log(presentationId);

    let presentation = await appwrite.database.getDocument("presentations", presentationId);
    console.log("loaded presentation", presentation);

    let presentationVersions = await appwrite.database.listDocuments("presentationVersions", [
        Query.equal("presentation", presentationId)
    ]);

    let presentationVersion = presentationVersions.documents[presentationVersions.documents.length - 1];
    let storageFileId = presentationVersion.storageFile;

    let storageFile = await appwrite.storage.getFile(storageFileId);
    let storageFileUrl = await appwrite.storage.getFileDownload(storageFileId);

    session.loadPdf(storageFileUrl.href);

    console.log("storage file url", storageFileUrl.href);

    console.log("presentation versions", presentationVersions);
}

new UserInterface();

loadLoginData();
//loadTestData();
parseUrl();
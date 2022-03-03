import { EditorData, data, initData, terminateData } from "../model/data.js";
import { ObservableArray } from "../../../common/model/ObservableArray.js";
import { cloneDomTemplate, ensureCssClassPresentIff } from "../../../common/ui/dom-utils.js";
import { ActivePdf } from "../model/ActivePdf.js";
import { Comment } from "../model/Comment.js";
import { UiScreen } from "../../../common/ui/UiScreen.js";
import pdfjsLib from "pdfjs-dist/webpack.js";

// All the code that is necessary for feeding the PDFJS render output into a canvas.
// Currently used for the main PDF display and the thumbnail preview.
class UiPageCanvas {
    constructor(canvasEl) {
        this.canvasEl = canvasEl;
        this.canvasCtx = this.canvasEl.getContext("2d");
        this.currentRenderTask = null;
        this.currentPage = null;
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
        if (pdfPage === null) {
            return;
        }

        this.currentPdfPage = pdfPage;

        if (this.currentRenderTask !== null) {
            this.currentRenderTask.cancel();
            this.currentRenderTask = null;
        }

        let viewport = pdfPage.viewport;

        // Without any transform, PDFJS will try to render in the coordinate system
        // given by the viewport. Apply a scale to make the PDF fit into the canvas.
        // An alternative solution might be to create a new viewport, but this seems nicest.
        let scaleX = this.canvasEl.width / viewport.width;
        let scaleY = this.canvasEl.height / viewport.height;

        let renderTask = pdfPage.pdfJsPage.render({
            canvasContext: this.canvasCtx,

            // I think this encodes the first two rows of the 3x3 homogeneous transform in column-major
            // layout (last row can be set to 0 0 1 for affine transforms). It is applied like so:
            // transformed_x = transform[0]*x + transform[2]*y + transform[4]
            // transformed_y = transform[1]*x + transform[3]*y + transform[5]
            transform: [scaleX, 0, 0, scaleY, 0, 0],

            viewport,
        });

        this.currentRenderTask = renderTask;

        (async () => {
            let result = await renderTask.promise;
            console.log("render task result", result);
            this.currentRenderTask = null;
        })();
    }
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

        data.activePdf.addEventListener(ActivePdf.EVENT_ACTIVE_PAGE_CHANGED, () => this.updateSelectionState());
        
        this.updateSelectionState();
        this._fetchPage();
    }

    // Asynchronously fill the canvas with our page.
    async _fetchPage() {
        let activePdfPage = await data.activePdf.fetchPage(this.pageNo);

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

    // TODO(optimize): This is called for every thumbnail, in theory we only need to call this for two thumbnails.
    updateSelectionState() {
        let isSelected = (data.activePdf.activePageNo === this.pageNo);
        ensureCssClassPresentIff(isSelected, "selected", this.el, this.pageNoEl);
    }

    onClick() {
        data.activePdf.setActivePage(this.pageNo);
    }
}

class UiThumbnailBar {
    constructor(screen) {
        this.el = screen.el.querySelector(".id-sidebar-left");

        if (data.hasPdf()) {
            this.createThumbnails();
        }

        data.addEventListener(EditorData.EVENT_PDF_LOADED, () => this.createThumbnails());
    }

    // Responsible for creating all the little thumbnails.
    // TODO: Remove old thumbnails once a new PDF is loaded?
    createThumbnails() {
        this.el.innerHTML = "";

        let numPages = data.activePdf.pdfJsPdf.numPages;

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
    constructor(screen) {
        this.pageCanvas = new UiPageCanvas(screen.el.querySelector(".id-pdf-canvas"));
        this.textLayerEl = screen.el.querySelector(".id-pdf-text-layer");

        data.addEventListener(EditorData.EVENT_PDF_LOADED, () => this.onPdfLoaded());
    }

    // We only care about this event to be able to subscribe to the active page event.
    onPdfLoaded() {
        data.activePdf.addEventListener(ActivePdf.EVENT_ACTIVE_PAGE_CHANGED, () => this.onActivePageChanged());
    }

    async onActivePageChanged() {
        let activePdfPage = await data.activePdf.fetchPage(data.activePdf.activePageNo);
        
        let pdfJsPage = activePdfPage.pdfJsPage;
        let viewport = activePdfPage.viewport;

        this.pageCanvas.setDimensions(viewport.width, viewport.height);
        this.pageCanvas.renderPage(activePdfPage);

        { // Update the text layer.
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

// An item in the timeline, representing a version of the presentation.
class UiTimelineVersion {
    constructor(version) {
        this.el = cloneDomTemplate("#version-template");

        this.labelEl = this.el.querySelector(".label");
        this.labelEl.textContent = version.label;

        this.el.addEventListener("click", () => this.onClick());

        this.version = version;
        this.updateSelectionState();

        data.addEventListener(EditorData.EVENT_ACTIVE_VERSION_CHANGED, () => this.updateSelectionState());
    }

    onClick() {
        data.setVersion(this.version);
    }
    
    // TODO(optimize): This is called for every version item, in theory we only need to call this twice.
    updateSelectionState() {
        let isSelected = (data.activeVersion === this.version);
        ensureCssClassPresentIff(isSelected, "selected", this.el);
    }
}

class UiTimeline {
    constructor(screen) {
        this.el = screen.el.querySelector(".id-version-list");

        this.addVersionButtonEl = screen.el.querySelector(".id-add-version-button");

        this.fileInputEl = screen.el.querySelector(".id-file-input");
        this.fileInputEl.addEventListener("change", () => this.onAddButtonClicked());

        data.versions.addEventListener(ObservableArray.EVENT_ITEM_ADDED, e => this.onVersionAdded(e));
    }

    onVersionAdded(e) {
        let version = e.data.item;
        let uiVersion = new UiTimelineVersion(version);
        this.el.insertBefore(uiVersion.el, this.addVersionButtonEl);
    }

    onAddButtonClicked() {
        data.createPresentationVersion(data.presentationId, "V"+(data.versions.items.length+1), this.fileInputEl.files[0]);
    }
}

class UiRightSidebar {
    constructor(screen) {
        this.el = screen.el.querySelector(".id-sidebar-right");

        this.commentList = new UiCommentList(screen);
        this.commentInputFields = new UiCommentInputFields(screen);
    }
}

class UiComment {
    constructor(comment) {
        this.el = cloneDomTemplate("#comment-template");

        this.textEl = this.el.querySelector(".comment-text");
        this.textEl.textContent = comment.text;

        this.authorEl = this.el.querySelector(".comment-author");
        this.authorEl.textContent = comment.author;
    }
}

class UiCommentList {
    constructor(screen) {
        this.el = screen.el.querySelector(".id-comment-list");
        data.addEventListener(EditorData.EVENT_PDF_LOADED, () => this.onPdfLoaded());
    }

    // We only care about this event to be able to subscribe to the active page event.
    onPdfLoaded() {
        data.activePdf.activePageComments.comments.addEventListener(ObservableArray.EVENT_ITEM_ADDED, e => this.onCommentAdded(e.data.item));
        data.activePdf.activePageComments.comments.addEventListener(ObservableArray.EVENT_CLEARED, e => this.onCommentsCleared());
    }

    onCommentAdded(comment) {
        let uiComment = new UiComment(comment);
        this.el.appendChild(uiComment.el);
    }

    onCommentsCleared() {
        this.el.innerHTML = "";
    }
}

class UiCommentInputFields {
    constructor(screen) {
        this.nameInputField = screen.el.querySelector(".id-name-input");

        this.commentInputField = screen.el.querySelector(".id-comment-input");
        this.commentInputField.addEventListener("keydown", e => this.onKeyDown(e));
    }

    onKeyDown(e) {
        if(e.keyCode !== 13) {
            return;
        }

        // TODO: (Why) do we need this?
        e.preventDefault();

        let text = this.commentInputField.value;
        let name = this.nameInputField.value;

        this.commentInputField.value = "";

        let comment = new Comment(name, text);

        data.activePdf.activePageComments.createComment(comment);
    }
}

class UiEditorScreen extends UiScreen {
    constructor(screenParameters) {
        super("#editor-screen-template");

        initData(screenParameters.presentation);

        this.thumbnailBar = new UiThumbnailBar(this);
        this.contentCenter = new UiContentCenter(this);
        this.timeline = new UiTimeline(this);
        this.rightSideBar = new UiRightSidebar(this);
    }

    terminate() {
        super.terminate();
        terminateData();
    }
}

export { UiEditorScreen };
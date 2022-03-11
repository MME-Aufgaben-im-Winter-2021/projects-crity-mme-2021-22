import { Listener } from "../../../../common/model/Observable.js";
import { data, EditorData } from "../../model/data.js";
import { UiPageCanvas } from "../UiPageCanvas.js";
import pdfjsLib from "pdfjs-dist/webpack.js";
import { ObservableArray } from "../../../../common/model/ObservableArray.js";
import { cloneDomTemplate } from "../../../../common/ui/dom-utils.js";
import { Comment } from "../../../../common/model/Comment.js";
import { EditorSelTracker } from "../../model/EditorSelTracker.js";
import { VersionComment } from "../../../../common/model/VersionComment.js";
import { EditorCommentEditing } from "../../model/EditorCommentEditing.js";

// The PDF-viewer proper. We only display a single page for now.
// PDFJS renders into a canvas, however this alone does not allow for selecting
// text. We therefore construct a rough facsimile (the "text layer") of the PDF in the DOM.
// PDFJS does this for us. This facsimile is positioned atop the canvas. The text is all there,
// but we make it transparent. A good way to understand how this works is to using element inspection
// in your web browser.
class UiContentCenter {
    constructor(screen) {
        this.markerContainerEl = screen.el.querySelector(".id-marker-container");
        this.pageCanvas = new UiPageCanvas(screen.el.querySelector(".id-pdf-canvas"));
        this.textLayerEl = screen.el.querySelector(".id-pdf-text-layer");

        this.listener = new Listener();

        this.textLayerEl.addEventListener("click", e => this.onPageCanvasClicked(e));

        this.commentEditingMarkerEl = null;
        // Does not include the editing marker.
        this.commentMarkers = [];

        data.commentEditing.addEventListener(EditorCommentEditing.EVENT_COMMENT_EDITING_STARTED, () => this.onCommentEditingStarted(), this.listener);
        data.commentEditing.addEventListener(EditorCommentEditing.EVENT_COMMENT_EDITING_FINISHED, () => this.onCommentEditingFinished(), this.listener);

        data.selTracker.addEventListener(EditorSelTracker.EVENT_ACTIVE_PAGE_CHANGED, () => this.onActivePageChanged(), this.listener);

        data.addEventListener(EditorData.EVENT_VERSION_COMMENT_QUERY_CHANGED, () => this.onVersionCommentQueryChanged(), this.listener);
    }

    terminate() {
        this.listener.terminate();
    }

    async onCommentEditingStarted() {
        this.commentEditingMarkerEl = await this.createCommentMarker(data.commentEditing.editedVersionComment);
        data.commentEditing.editedVersionComment.addEventListener(VersionComment.EVENT_PAGE_POS_CHANGED, () => this.onEditedVersionCommentPosChanged(), this.listener);
    }

    async onEditedVersionCommentPosChanged() {
        // Kill and replace, kind of ugly.
        this.commentEditingMarkerEl?.remove();
        this.commentEditingMarkerEl = await this.createCommentMarker(data.commentEditing.editedVersionComment);
    }

    onVersionCommentQueryChanged() {
        this.clearCommentMarkers();
        data.versionCommentQuery.versionComments.addEventListener(ObservableArray.EVENT_ITEM_ADDED, e => this.createCommentMarker(e.data.item), this.listener);
        data.versionCommentQuery.versionComments.addEventListener(ObservableArray.EVENT_CLEARED, () => this.clearCommentMarkers(), this.listener);
    }

    onCommentEditingFinished() {
        this.commentEditingMarkerEl?.remove();
    }

    onPageCanvasClicked(e) {
        // Convert to the textLayer's local coordinate system.
        let textLayerRect = this.textLayerEl.getBoundingClientRect(),
            textLayerX = e.clientX - textLayerRect.left,
            textLayerY = e.clientY - textLayerRect.top,

            // Now, convert to page-relative coordinates, i.e. top left of the page = (0, 0), bottom right of the page = (1, 1).
            pageX = textLayerX / this.textLayerEl.offsetWidth,
            pageY = textLayerY / this.textLayerEl.offsetHeight;

        if (data.commentEditing.isEditing()) {
            data.commentEditing.editedVersionComment.setPagePos(pageX, pageY);
        } else {
            let comment = new VersionComment(data.selTracker.version, data.selTracker.activePageNo, new Comment("", ""), pageX, pageY);
            data.commentEditing.startEditingComment(comment);
        }
    }

    async createCommentMarker(versionComment) {
        // Grrr, we're fetching the page over and over again. Does this cause PDFJS to do extra work?
        let activePdfPage = await data.selTracker.pdf.fetchPage(data.selTracker.activePageNo),
            viewport = activePdfPage.viewport,
            
            markerEl = cloneDomTemplate("#comment-marker"),
            
            viewportX = viewport.width * versionComment.pageX,
            viewportY = viewport.height * versionComment.pageY;

        markerEl.style.left = `${viewportX}px`;
        markerEl.style.top = `${viewportY}px`;

        this.markerContainerEl.appendChild(markerEl);

        return markerEl;
    }

    clearCommentMarkers() {
        this.markerContainerEl.innerHTML = "";
    }

    async onActivePageChanged() {
        let activePdfPage = await data.selTracker.pdf.fetchPage(data.selTracker.activePageNo), 
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
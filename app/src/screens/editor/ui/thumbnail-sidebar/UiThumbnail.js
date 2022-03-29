import { Listener } from "../../../../common/model/Observable.js";
import { cloneDomTemplate, ensureCssClassPresentIff } from "../../../../common/ui/dom-utils.js";
import { UiPageCanvas } from "../UiPageCanvas.js";
import { data } from "../../model/data.js";
import { EditorSelTracker } from "../../model/EditorSelTracker.js";
import { RenderSchedule } from "../renderSchedule.js";

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
        this.visible = false;
        this.pageCanvas = new UiPageCanvas(pageCanvasEl, RenderSchedule.PRIORITY_LEVEL_THE_OTHER_THUMBNAILS);

        this.listener = new Listener();
        data.selTracker.addEventListener(EditorSelTracker.EVENT_ACTIVE_PAGE_CHANGED, () => this.updateSelectionState(), this.listener);
        
        this.updateSelectionState();
        this.pFetchPage();

    }

    terminate() {
        this.pageCanvas.terminate();
        this.listener.terminate();
    }

    // TODO(optimize): Lazy thumbnail loading, or at least prioritize rendering thumbnails that are in view.
    // Asynchronously fill the canvas with our page.
    async pFetchPage() {
        let activePdfPage = await data.selTracker.pdf.fetchPage(this.pageNo),
            [width, height] = this.computeDimensions(activePdfPage);
        this.pageCanvas.setDimensions(width, height);
        this.pageCanvas.renderPage(activePdfPage);
    }

    // Compute width and height such that correct proportions are preserved and the longer axis has size `TARGET_SIZE`.
    static TARGET_SIZE = 150;
    //static DBG_FORCE_ASP = 0.5;
    computeDimensions(activePdfPage) {
        // There are probably more elegant ways to do this, but hopefully this is correct ;)
        // Note that at the end, width/height=asp as expected.

        let viewport = activePdfPage.viewport,
            width, height,
            asp = viewport.width / viewport.height;
        if (typeof UiThumbnail.DBG_FORCE_ASP !== "undefined") {
            asp = UiThumbnail.DBG_FORCE_ASP;
        }
        if (asp > 1) {
            width = UiThumbnail.TARGET_SIZE;
            height = width / asp;
        } else {
            height = UiThumbnail.TARGET_SIZE;
            width = height * asp;
        }

        return [width, height];
    }

    // Set and unset this from the thumbnail bar.
    setVisible(visible) {
        if (visible) {
            this.pageCanvas.reprioritize(RenderSchedule.PRIORITY_LEVEL_THE_VISIBLE_THUMBNAILS);
        } else {
            this.pageCanvas.reprioritize(RenderSchedule.PRIORITY_LEVEL_THE_OTHER_THUMBNAILS);
        }
    }

    // TODO(optimize): This is called for every thumbnail, in theory we only need to call this for two thumbnails.
    updateSelectionState() {
        let isSelected = (data.selTracker.activePageNo === this.pageNo);
        ensureCssClassPresentIff(isSelected, "selected", this.el, this.pageNoEl);
    }

    onClick() {
        data.selTracker.activatePage(this.pageNo);
    }
}

export { UiThumbnail };
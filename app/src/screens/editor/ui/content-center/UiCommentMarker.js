import { Listener } from "../../../../common/model/Observable.js";
import { VersionComment } from "../../../../common/model/VersionComment.js";
import { cloneDomTemplate } from "../../../../common/ui/dom-utils.js";
import { lerp } from "../../../../common/utils.js";
import { UiPageRectTracker } from "./UiPageRectTracker.js";

class UiCommentMarker {
    static DIAM_WHEN_OPEN = 2*15;
    static DIAM_WHEN_CLOSED = 2*7;

    constructor(pageRectTracker, versionComment) {
        this.pageRectTracker = pageRectTracker;
        this.versionComment = versionComment;
        this.el = cloneDomTemplate("#comment-marker");
        this.listener = new Listener();

        this.versionComment.addEventListener(VersionComment.EVENT_PAGE_POS_CHANGED, () => this.updatePosition(), this.listener);
        this.pageRectTracker.addEventListener(UiPageRectTracker.EVENT_PAGE_RECT_CHANGED, () => this.updatePosition(), this.listener);
        this.versionComment.addEventListener(VersionComment.EVENT_SELECTION_STATE_CHANGED, () => this.updateSelectionState(), this.listener);

        this.updatePosition();

        this.el.style.transition = "width 0.2s, height 0.2s";
        this.updateSelectionState();
    }

    terminate() {
        this.el.remove();
        this.listener.terminate();
    }

    updatePosition() {
        let pageRect, x, y;

        pageRect = this.pageRectTracker.computePageRect();

        x = lerp(pageRect.left, pageRect.right, this.versionComment.pageX);
        y = lerp(pageRect.top, pageRect.bottom, this.versionComment.pageY);

        this.el.style.left = `${x}px`;
        this.el.style.top = `${y}px`;
    }

    updateSelectionState() {
        this.el.style.height = 
        this.el.style.width = 
        `${this.versionComment.selected ? UiCommentMarker.DIAM_WHEN_OPEN : UiCommentMarker.DIAM_WHEN_CLOSED}px`;
        if(this.versionComment.selected){
            this.el.style.backgroundColor = "red";
        }else{
            this.el.style.backgroundColor = "orange";
        }
    }
}

export { UiCommentMarker };
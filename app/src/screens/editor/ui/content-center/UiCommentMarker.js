import { Listener } from "../../../../common/model/Observable.js";
import { VersionComment } from "../../../../common/model/VersionComment.js";
import { cloneDomTemplate } from "../../../../common/ui/dom-utils.js";
import { lerp } from "../../../../common/utils.js";
import { UiPageRectTracker } from "./UiPageRectTracker.js";

class UiCommentMarker {
    constructor(pageRectTracker, versionComment) {
        this.pageRectTracker = pageRectTracker;
        this.versionComment = versionComment;
        this.el = cloneDomTemplate("#comment-marker");
        this.listener = new Listener();

        this.versionComment.addEventListener(VersionComment.EVENT_PAGE_POS_CHANGED, () => this.updatePosition(), this.listener);
        this.pageRectTracker.addEventListener(UiPageRectTracker.EVENT_PAGE_RECT_CHANGED, () => this.updatePosition(), this.listener);
        this.versionComment.addEventListener(VersionComment.EVENT_SELECTED, e => this.setSelected(e), this.listener);

        this.updatePosition();
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

    setSelected(e) {
        if(e.data.open) {
            this.el.classList.remove("h-4", "w-4", "bg-amber-500");
            this.el.classList.add("h-6", "w-6", "bg-red-900");
        }else{
            this.el.classList.remove("h-6", "w-6", "bg-red-900");
            this.el.classList.add("h-4", "w-4", "bg-amber-500");
        }
    }
}

export { UiCommentMarker };
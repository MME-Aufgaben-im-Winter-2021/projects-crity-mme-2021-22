import { Listener } from "../../../../common/model/Observable.js";
import { VersionComment } from "../../../../common/model/VersionComment.js";
import { cloneDomTemplate } from "../../../../common/ui/dom-utils.js";
import { lerp } from "../../../../common/utils.js";
import { data } from "../../model/data.js";
import { UiPageRectTracker } from "./UiPageRectTracker.js";

class UiCommentMarker {
    constructor(pageRectTracker, versionComment) {
        this.pageRectTracker = pageRectTracker;
        this.versionComment = versionComment;
        this.el = cloneDomTemplate("#comment-marker");
        this.listener = new Listener();

        this.versionComment.addEventListener(VersionComment.EVENT_PAGE_POS_CHANGED, () => this.updatePosition(), this.listener);
        this.pageRectTracker.addEventListener(UiPageRectTracker.EVENT_PAGE_RECT_CHANGED, () => this.updatePosition(), this.listener);

        this.updatePosition();
    }

    terminate() {
        this.el.remove();
        this.listener.terminate();
    }

    updatePosition() {
        let pageRect = this.pageRectTracker.computePageRect();

        let x = lerp(pageRect.left, pageRect.right, this.versionComment.pageX);
        let y = lerp(pageRect.top, pageRect.bottom, this.versionComment.pageY);

        this.el.style.left = `${x}px`;
        this.el.style.top = `${y}px`;
    }
}

export { UiCommentMarker };
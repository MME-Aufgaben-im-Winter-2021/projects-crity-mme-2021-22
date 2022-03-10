import { ObservableArray } from "../../../../common/model/ObservableArray.js";
import { UiComment } from "./UiComment.js";
import { data, EditorData } from "../../model/data.js";
import { Listener } from "../../../../common/model/Observable.js";

class UiCommentList {
    constructor(screen) {
        this.el = screen.el.querySelector(".id-comment-list");
        this.listener = new Listener();

        this.uiComments = [];

        data.addEventListener(EditorData.EVENT_VERSION_COMMENT_QUERY_CHANGED, () => this.onVersionCommentQueryChanged(), this.listener);
    }

    terminate() {
        this.listener.terminate();
    }

    onVersionCommentQueryChanged() {
        this.clearUiComments();
        
        data.versionCommentQuery.versionComments.addEventListener(ObservableArray.EVENT_ITEM_ADDED, e => this.onVersionCommentAdded(e.data.item), this.listener);
        data.versionCommentQuery.versionComments.addEventListener(ObservableArray.EVENT_CLEARED, () => this.clearUiComments(), this.listener);
    }

    onVersionCommentAdded(versionComment) {
        let uiComment = new UiComment(versionComment.comment);
        this.el.appendChild(uiComment.el);
    }

    clearUiComments() {
        this.uiComments.forEach(uiComment => {
            uiComment.terminate();
        });
        this.el.innerHTML = "";
    }
}

export {UiCommentList };

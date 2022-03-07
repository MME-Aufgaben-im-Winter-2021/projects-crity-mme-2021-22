import { ObservableArray } from "../../../../common/model/ObservableArray.js";
import { UiComment } from "./UiComment.js";
import { data, EditorData } from "../../model/data.js";
import { Listener } from "../../../../common/model/Observable.js";

class UiCommentList {
    constructor(screen) {
        this.el = screen.el.querySelector(".id-comment-list");
        this.listener = new Listener();
        data.addEventListener(EditorData.EVENT_PDF_LOADED, () => this.onPdfLoaded(), this.listener);
    }

    terminate() {
        this.listener.terminate();
    }

    // We only care about this event to be able to subscribe to the active page event.
    onPdfLoaded() {
        data.activePdf.activePageComments.comments.addEventListener(ObservableArray.EVENT_ITEM_ADDED, e => this.onCommentAdded(e.data.item), this.listener);
        data.activePdf.activePageComments.comments.addEventListener(ObservableArray.EVENT_CLEARED, () => this.onCommentsCleared(), this.listener);
    }

    onCommentAdded(comment) {
        let uiComment = new UiComment(comment);
        this.el.appendChild(uiComment.el);
    }

    onCommentsCleared() {
        this.el.innerHTML = "";
    }
}

export {UiCommentList };

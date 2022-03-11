import { data } from "../../model/data.js";
import { Listener } from "../../../../common/model/Observable.js";
import { EditorCommentEditing } from "../../model/EditorCommentEditing.js";

class UiCommentEditor {
    constructor(screen) {
        this.listener = new Listener();
        this.el = screen.el.querySelector(".id-comment-editor");

        this.nameInputFieldEl = screen.el.querySelector(".id-name-input");

        this.quitEditingButtonEl = screen.el.querySelector(".id-quit-editing-button");
        this.quitEditingButtonEl.addEventListener("click", () => this.onQuitEditingButtonClicked());

        this.commentInputFieldEl = screen.el.querySelector(".id-comment-input");
        this.commentInputFieldEl.addEventListener("keydown", e => this.onKeyDown(e));

        this.setVisible(false);

        data.commentEditing.addEventListener(EditorCommentEditing.EVENT_COMMENT_EDITING_STARTED, () => this.onCommentEditingStarted(), this.listener);
        data.commentEditing.addEventListener(EditorCommentEditing.EVENT_COMMENT_EDITING_FINISHED, () => this.onCommentEditingFinished(), this.listener);
    }

    terminate() {
        this.listener.terminate();
    }

    setVisible(visible) {
        if (visible) {
            this.el.style = "";
        } else {
            this.el.style = "display: none";
        }
    }

    onKeyDown(e) {
        if(e.keyCode !== /* enter */ 13) {
            return;
        }

        // TODO: (Why) do we need this?
        e.preventDefault();
        
        data.commentEditing.editedVersionComment.comment.author = this.nameInputFieldEl.value;
        data.commentEditing.editedVersionComment.comment.text = this.commentInputFieldEl.value;
        this.commentInputFieldEl.value = "";

        data.commentEditing.finishEditingComment(true);
    }

    onQuitEditingButtonClicked() {
        data.commentEditing.finishEditingComment(false);
    }

    onCommentEditingStarted() {
        this.setVisible(true);
    }

    onCommentEditingFinished() {
        this.setVisible(false);
    }
}

export { UiCommentEditor };
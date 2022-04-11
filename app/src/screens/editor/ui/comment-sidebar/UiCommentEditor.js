import { data } from "../../model/data.js";
import { Listener } from "../../../../common/model/Observable.js";
import { EditorCommentEditing } from "../../model/EditorCommentEditing.js";
import { KeyCodes } from "../../../../common/ui/dom-utils.js";
import { accountSession } from "../../../../common/model/AccountSession.js";

class UiCommentEditor {
    constructor(screen) {
        this.listener = new Listener();
        this.el = screen.el.querySelector(".id-comment-editor");

        this.nameInputFieldEl = screen.el.querySelector(".id-user-name");

        this.quitEditingButtonEl = screen.el.querySelector(".id-quit-editing-button");
        this.quitEditingButtonEl.addEventListener("click", () => this.onQuitEditingButtonClicked());

        this.commentInputFieldEl = screen.el.querySelector(".id-comment-input");
        this.commentInputFieldEl.addEventListener("keydown", e => this.onKeyDown(e));

        this.commentEditorText = screen.el.querySelector(".comment-editor-text");

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
            this.quitEditingButtonEl.style = "";
            this.commentEditorText.textContent = "Add Comment";
            
        } else {
            this.el.style = "display: none";
        }
    }

    onKeyDown(e) {
        if(this.commentEditorText.textContent !== "Add Comment") {
            return;
        }
        if(e.keyCode !== KeyCodes.ENTER) {
            return;
        }

        // TODO: (Why) do we need this?
        e.preventDefault();
        
        data.commentEditing.editedVersionComment.comment.author = accountSession.pAccountName;
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
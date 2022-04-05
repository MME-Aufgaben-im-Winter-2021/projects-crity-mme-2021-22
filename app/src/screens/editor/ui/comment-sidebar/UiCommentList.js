import { ObservableArray } from "../../../../common/model/ObservableArray.js";
import { UiComment } from "./UiComment.js";
import { data, EditorData } from "../../model/data.js";
import { Listener } from "../../../../common/model/Observable.js";
import { EditorCommentEditing } from "../../model/EditorCommentEditing.js";
import { KeyCodes } from "../../../../common/ui/dom-utils.js";
import { accountSession } from "../../../../common/model/AccountSession.js";

class UiCommentList {
    constructor(screen, editorScreen) {
        this.el = screen.el.querySelector(".id-comment-list");
        this.listener = new Listener();

        this.editorScreen = editorScreen;
        this.uiComments = [];
        this.lastOpen = null;

        data.addEventListener(EditorData.EVENT_VERSION_COMMENT_QUERY_CHANGED, () => this.onVersionCommentQueryChanged(), this.listener);
        data.commentEditing.addEventListener(EditorCommentEditing.EVENT_COMMENT_EDITING_STARTED, () => this.onCommentEditingStarted(), this.listener);

        this.el2 = screen.el.querySelector(".id-comment-editor");

        this.nameInputFieldEl = screen.el.querySelector(".id-user-name");

        this.quitEditingButtonEl = screen.el.querySelector(".id-quit-editing-button");

        this.commentInputFieldEl = screen.el.querySelector(".id-comment-input");
        this.commentInputFieldEl.addEventListener("keydown", e => this.onKeyDown(e));

        this.commentEditorText = screen.el.querySelector(".comment-editor-text");

    }

    setCommentsReviewerMode() {
        this.authorMode = false;
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
        let uiComment = new UiComment(versionComment.comment, this, versionComment, this.editorScreen);
        for(let i = 0; i < this.uiComments.length; i++) {
            if(this.uiComments[i].comment.votes.length < uiComment.comment.votes.length) {
                this.el.insertBefore(uiComment.el, this.uiComments[i].el);
                this.uiComments.splice(this.uiComments.indexOf(this.uiComments[i]), 0, uiComment);
                return;
            }
        }
        this.el.appendChild(uiComment.el);
        this.uiComments.push(uiComment);
    }

    clearUiComments() {
        this.uiComments.forEach(uiComment => {
            uiComment.terminate();
        });
        this.uiComments.length = 0;
        this.el.innerHTML = "";
        this.toggleCommentEditor(false);
    }

    onCommentEditingStarted() {
        if(this.lastOpen !== null) {
            this.lastOpen.toggle();
            this.lastOpen = null;
        }
    }

    toggleCommentEditor(visible) {
        if (visible) {
            this.el2.style = "";
            this.quitEditingButtonEl.style = "display: none";
            this.commentEditorText.textContent = "Start discussing";
        } else {
            this.el2.style = "display: none";
        }
    }

    shutDownLastOpen(elem) {
        data.commentEditing.finishEditingComment(false);
        // Kein zuletzt geöffnetes
        if(this.lastOpen === null) {
            this.lastOpen = elem;
            this.toggleCommentEditor(true);
            return;
        }
        // Zuletzt geöffnetes ist neu geöffnetes
        if(this.lastOpen === elem) {
            this.lastOpen = null;
            this.toggleCommentEditor(false);
            return;
        }
        // Zuletzt geöffnetes und neu geöffnetes unterschiedlich
        this.lastOpen.toggle();
        this.lastOpen = elem;
        this.toggleCommentEditor(true);
    }

    onKeyDown(e) {
        if(this.commentEditorText.textContent !== "Start discussing") {
            return;
        }
        if(e.keyCode !== KeyCodes.ENTER) {
            return;
        }
        this.lastOpen.versionComment.submitComment(accountSession.pAccountName, this.commentInputFieldEl.value);
    }
}

export {UiCommentList };

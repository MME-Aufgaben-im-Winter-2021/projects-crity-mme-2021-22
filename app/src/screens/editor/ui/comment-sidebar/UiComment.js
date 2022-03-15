import { cloneDomTemplate } from "../../../../common/ui/dom-utils.js";

class UiComment {
    constructor(comment, parent, versionComment) {
        this.parent = parent;
        this.versionComment = versionComment;

        this.el = cloneDomTemplate("#thread-template");

        this.textEl = this.el.querySelector(".thread-title");
        this.textEl.textContent = comment.text;

        this.authorEl = this.el.querySelector(".thread-author");
        this.authorEl.textContent = comment.author;

        this.header = this.el.querySelector(".thread-header");
        this.header.addEventListener("click", () => this.clicked());

        this.comments = this.el.querySelector(".thread-comments");
        this.comments.style.display = "none";

    }

    addComments(comment) {
        this.comments.innerHTML = "";
        for(let i = 0; i < comment.authors.length; i++) {
            let commentElement = cloneDomTemplate("#thread-comment-template");

            let commentElementText = commentElement.querySelector(".comment-text");
            commentElementText.textContent = comment.messages[i];

            let commentElementAuthor = commentElement.querySelector(".comment-author");
            commentElementAuthor.textContent = comment.authors[i];

            this.comments.appendChild(commentElement);
        }
    }

    clicked() {
        this.parent.shutDownLastOpen(this);
        this.toggle();
    }

    toggle() {
        if (this.comments.style.display === "none") {
            this.comments.style.display = "block";
            this.versionComment.subscribeToCommentDocument(this);
            this.versionComment.loadNewestComments(this);
        } else {
            this.comments.style.display = "none";
            this.versionComment.unsubscribeFunc();
        }
    }

    terminate() {
        return;
    }

    addComment(author, text, fromAppwrite) {
        let commentElement = cloneDomTemplate("#thread-comment-template");

        let commentElementText = commentElement.querySelector(".comment-text");
        commentElementText.textContent = text;

        let commentElementAuthor = commentElement.querySelector(".comment-author");
        commentElementAuthor.textContent = author;

        this.comments.appendChild(commentElement);

        if(!fromAppwrite) {
            this.versionComment.submitComment(author, text);
        }
    }
}

export { UiComment };
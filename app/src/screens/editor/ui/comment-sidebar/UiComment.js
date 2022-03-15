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

    clicked() {
        this.parent.shutDownLastOpen(this);
        this.toggle();
    }

    toggle() {
        if (this.comments.style.display === "none") {
            this.comments.style.display = "block";
        } else {
            this.comments.style.display = "none";
        }
    }

    terminate() {
        return;
    }

    addComment(author, text) {
        let commentElement = cloneDomTemplate("#thread-comment-template");

        let commentElementText = commentElement.querySelector(".comment-text");
        commentElementText.textContent = text;

        let commentElementAuthor = commentElement.querySelector(".comment-author");
        commentElementAuthor.textContent = author;

        this.comments.appendChild(commentElement);
        this.versionComment.submitComment(author, text);
    }
}

export { UiComment };
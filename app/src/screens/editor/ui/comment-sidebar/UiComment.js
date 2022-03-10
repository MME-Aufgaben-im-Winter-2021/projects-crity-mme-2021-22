import { cloneDomTemplate } from "../../../../common/ui/dom-utils.js";

class UiComment {
    constructor(comment) {
        this.el = cloneDomTemplate("#comment-template");

        this.textEl = this.el.querySelector(".comment-text");
        this.textEl.textContent = comment.text;

        this.authorEl = this.el.querySelector(".comment-author");
        this.authorEl.textContent = comment.author;
    }

    terminate() {
        return;
    }
}

export { UiComment };
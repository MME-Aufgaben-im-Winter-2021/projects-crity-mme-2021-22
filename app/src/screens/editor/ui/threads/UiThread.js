import { cloneDomTemplate } from "../../../../common/ui/dom-utils.js";

class UiThread {
    constructor(thread, parent) {
        this.parent = parent;

        this.el = cloneDomTemplate("#thread-template");

        this.titleEl = this.el.querySelector(".thread-title");
        this.titleEl.textContent = thread.title;

        this.authorEl = this.el.querySelector(".thread-author");
        this.authorEl.textContent = thread.author;

        this.comments = this.el.querySelector(".thread-comments");
        this.header = this.el.querySelector(".thread-header");
        this.header.addEventListener("click", () => this.clicked());

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
}

export { UiThread };
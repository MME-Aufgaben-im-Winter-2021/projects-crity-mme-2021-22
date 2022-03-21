import { cloneDomTemplate } from "../../../common/ui/dom-utils.js";
import { uiScreenSwapper } from "../../uiScreenSwapper.js";

let isHovering = false;

class UiPresentationItem {
    constructor(screen, presentation) {
        this.screen = screen;

        this.el = cloneDomTemplate("#presentation-template");
        this.el.addEventListener("click", () => this.onClick());

        this.presentation = presentation;

        this.titleEl = this.el.querySelector(".presentation-title");
        this.titleEl.textContent = presentation.title;

        this.descriptionEl = this.el.querySelector(".presentation-description");
        this.descriptionEl.textContent = presentation.description;

        this.dotsButtonEl = this.el.querySelector(".id-dots-button");
       // this.dotsButtonEl.addEventListener("click", () => this.onDotsButtonClicked());
        this.dotsButtonEl.addEventListener("mouseenter", () => this.enterHover());
        this.dotsButtonEl.addEventListener("mouseleave", () => this.leaveHover());
    }

    onClick() {
        if (!isHovering) {
            uiScreenSwapper.loadScreen("editor", {presentation: this.presentation.appwriteId});
        } else {
            console.log("cannot click");
        }
    }

    enterHover() {
        isHovering = true;
    }

    leaveHover() {
        isHovering = false;
    }

}

export { UiPresentationItem };
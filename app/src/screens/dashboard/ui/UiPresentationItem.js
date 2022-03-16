import { cloneDomTemplate } from "../../../common/ui/dom-utils.js";
import { uiScreenSwapper } from "../../uiScreenSwapper.js";

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
        this.dotsButtonEl.addEventListener("click", () => this.onDotsButtonClicked());
    }

    onClick() {
        uiScreenSwapper.loadScreen("editor", {presentation: this.presentation.appwriteId});
    }

    onDotsButtonClicked() {
        console.log("robbed confirmed");
    }

}

export { UiPresentationItem };
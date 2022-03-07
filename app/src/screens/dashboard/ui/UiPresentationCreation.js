import { data } from "../model/data.js";

class UiPresentationCreation {
    constructor(screen) {
        this.titleInputEl = screen.el.querySelector(".id-presentation-title-input");
        this.descriptionInputEl = screen.el.querySelector(".id-presentation-description-input");

        this.addButtonEl = screen.el.querySelector(".id-add-presentation-button");
        this.addButtonEl.addEventListener("click", () => this.onAddButtonClicked());
    }

    onAddButtonClicked() {
        let title = this.titleInputEl.value,
            description = this.descriptionInputEl.value;

        data.presentationList.createPresentation(title, description);
    }
}

export { UiPresentationCreation };
import { data } from "../model/data.js";

class UiPresentationCreation {
    constructor(screen) {
        this.titleInputEl = screen.el.querySelector(".id-presentation-title-input");
        this.descriptionInputEl = screen.el.querySelector(".id-presentation-description-input");
        this.modal = screen.el.querySelector(".id-modal");
        this.addProjectButtonEl = screen.el.querySelector(".id-add-project-button");
        this.addButtonEl = screen.el.querySelector(".id-add-presentation-button");
        this.closeButtonEl = screen.el.querySelector(".id-close-button");

        this.addButtonEl.addEventListener("click", () => this.onAddButtonClicked());
        this.addProjectButtonEl.addEventListener("click", () => this.onAddProjectButtonClicked());
        this.closeButtonEl.addEventListener("click", () => this.onCloseButtonClicked());
    }

    onAddButtonClicked() {
        let title = this.titleInputEl.value,
            description = this.descriptionInputEl.value;

        data.presentationList.createPresentation(title, description);

        this.titleInputEl.value = "";
        this.descriptionInputEl.value = "";
        this.modal.classList.add("hidden");
    }

    onAddProjectButtonClicked() {
        this.modal.classList.remove("hidden");
    }

    onCloseButtonClicked() {
        this.modal.classList.add("hidden");
    }

}

export { UiPresentationCreation };
import { cloneDomTemplate } from "../../../common/ui/dom-utils.js";
import { uiScreenSwapper } from "../../uiScreenSwapper.js";
import { data } from "../model/data.js";

let isHovering = false,
    dropDownActive = false;

class UiPresentationItem {
    constructor(screen, presentation, parent) {
        this.screen = screen;
        this.parent = parent;

        this.el = cloneDomTemplate("#presentation-template");
        this.el.addEventListener("click", () => this.onClick());

        this.presentation = presentation;

        this.titleEl = this.el.querySelector(".presentation-title");
        this.titleEl.textContent = presentation.title;

        this.descriptionEl = this.el.querySelector(".presentation-description");
        this.descriptionEl.textContent = presentation.description;

        this.dropDown = this.el.querySelector(".id-dropdown");
        this.dropDownEdit = this.el.querySelector(".id-dropdown-edit");
        this.dropDownDelete = this.el.querySelector(".id-dropdown-delete");
        this.dropDown.addEventListener("mouseenter", () => this.enterHover());
        this.dropDown.addEventListener("mouseleave", () => this.leaveHover());
        this.dropDownEdit.addEventListener("click", () => this.onDropDownEditClicked());
        this.dropDownDelete.addEventListener("click", () => this.onDropDownDeleteClicked());

        this.modal = this.el.querySelector(".id-modal");
        this.closeModalButton = this.el.querySelector(".id-close-modal-button");
        this.deletePresentationButton = this.el.querySelector(".id-delete-presentation-button");
        this.cancelButton = this.el.querySelector(".id-cancel-button");
        this.modal.addEventListener("mouseenter", () => this.enterHover());
        this.modal.addEventListener("mouseleave", () => this.leaveHover());
        this.closeModalButton.addEventListener("click", () => this.onCloseModalButtonClicked());
        this.deletePresentationButton.addEventListener("click", () => this.onDeleteButtonClicked());
        this.cancelButton.addEventListener("click", () => this.onCancelButtonClicked());

        this.dotsButtonEl = this.el.querySelector(".id-dots-button");
        this.dotsButtonEl.addEventListener("click", () => this.onDotsButtonClicked());
        this.dotsButtonEl.addEventListener("mouseenter", () => this.enterHover());
        this.dotsButtonEl.addEventListener("mouseleave", () => this.leaveHover());
    }

    onClick() {
        if (!isHovering) {
            uiScreenSwapper.loadScreen("editor", {presentation: this.presentation.appwriteId});
        }
    }

    onDotsButtonClicked() {
        this.toggleDropDown();
    }

    onDropDownEditClicked() {
        console.log("edit presentation");
    }

    onDropDownDeleteClicked() {
        this.toggleDropDown();
        this.modal.classList.remove("hidden");
    }

    onDeleteButtonClicked() {
        this.modal.classList.add("hidden");
        data.presentationList.removePresentation(this.presentation);
        this.parent.removePresentation(this.el)
    }

    onCancelButtonClicked() {
        this.modal.classList.add("hidden");
    }

    onCloseModalButtonClicked() {
        this.modal.classList.add("hidden");
    }

    toggleDropDown() {
        if (!dropDownActive) {
            this.dropDown.classList.remove("hidden");
            dropDownActive = true;
        } else {
            this.dropDown.classList.add("hidden");
            dropDownActive = false;
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
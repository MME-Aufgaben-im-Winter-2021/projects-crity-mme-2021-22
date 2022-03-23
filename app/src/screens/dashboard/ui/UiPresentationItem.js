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

        this.editModal = this.el.querySelector(".id-modal-edit");
        this.closeEditModalButton = this.el.querySelector(".id-close-edit-modal-button");
        this.editTitle = this.el.querySelector(".id-edit-title-input");
        this.editTitle.value = presentation.title;
        this.editDescription = this.el.querySelector(".id-edit-description-input");
        this.editDescription.value = presentation.description;
        this.updateButton = this.el.querySelector(".id-update-presentation-button");
        this.editModal.addEventListener("mouseenter", () => this.enterHover());
        this.editModal.addEventListener("mouseleave", () => this.leaveHover());
        this.closeEditModalButton.addEventListener("click", () => this.onCloseModalButtonClicked(this.editModal));
        this.updateButton.addEventListener("click", () => this.onSaveEditClicked());

        this.deleteModal = this.el.querySelector(".id-delete-modal");
        this.closeDeleteModalButton = this.el.querySelector(".id-close-delete-modal-button");
        this.deletePresentationButton = this.el.querySelector(".id-delete-presentation-button");
        this.cancelButton = this.el.querySelector(".id-cancel-button");
        this.deleteModal.addEventListener("mouseenter", () => this.enterHover());
        this.deleteModal.addEventListener("mouseleave", () => this.leaveHover());
        this.closeDeleteModalButton.addEventListener("click", () => this.onCloseModalButtonClicked(this.deleteModal));
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
        this.toggleDropDown();
        this.editModal.classList.remove("hidden");
    }

    onSaveEditClicked() {
        let newTitle = this.editTitle.value,
            newDescription = this.editDescription.value;
        this.titleEl.textContent = newTitle;
        this.descriptionEl.textContent = newDescription;
        this.editModal.classList.add("hidden");
        this.parent.updatePresentation(this.el, newTitle, newDescription);
    }

    onDropDownDeleteClicked() {
        this.toggleDropDown();
        this.deleteModal.classList.remove("hidden");
    }

    onDeleteButtonClicked() {
        this.deleteModal.classList.add("hidden");
        data.presentationList.removePresentation(this.presentation);
        this.parent.removePresentation(this.el);
    }

    onCancelButtonClicked() {
        this.deleteModal.classList.add("hidden");
    }

    onCloseModalButtonClicked(modal) {
        modal.classList.add("hidden");
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
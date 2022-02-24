import { data, DashboardData } from "../model/data.js";
import { ObservableArray } from "../../../common/model/ObservableArray.js";
import { cloneDomTemplate } from "../../../common/ui/dom-utils.js";

// TODO: Redirect to login.html if no user is logged in?

class UiPresentationItem {
    constructor(presentation) {
        this.el = cloneDomTemplate("#presentation-template");
        this.el.addEventListener("click", () => this.onClick());

        this.presentation = presentation;

        this.titleEl = this.el.querySelector(".presentation-title");
        this.titleEl.textContent = presentation.title;

        this.descriptionEl = this.el.querySelector(".presentation-description");
        this.descriptionEl.textContent = presentation.description;
    }

    onClick() {
        window.location.href = `/index.html?presentation=${this.presentation.appwriteId}`;
    }
}

class UiPresentationList {
    constructor() {
        this.el = document.querySelector("#presentation-list");

        data.presentationList.presentations.addEventListener(ObservableArray.EVENT_ITEM_ADDED, e => this.onPresentationAdded(e));
    }

    onPresentationAdded(e) {
        let presentationItem = new UiPresentationItem(e.data.item);
        this.el.appendChild(presentationItem.el);
    }
}

class UiAddPresentation {
    constructor() {
        this.titleInputEl = document.querySelector("#presentation-title-input");
        this.descriptionInputEl = document.querySelector("#presentation-description-input");

        this.addButtonEl = document.querySelector("#add-presentation-button");
        this.addButtonEl.addEventListener("click", () => this.onAddButtonClicked());
    }

    onAddButtonClicked() {
        let title = this.titleInputEl.value;
        let description = this.descriptionInputEl.value;

        data.presentationList.createPresentation(title, description);
    }
}

class UiDashboardScreen {
    constructor() {
        this.presentationList = new UiPresentationList();
        this.addPresentation = new UiAddPresentation();
    }
}

new UiDashboardScreen();
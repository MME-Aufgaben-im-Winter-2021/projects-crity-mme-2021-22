import { DashboardData, data, initData, terminateData } from "../model/data.js";
import { ObservableArray } from "../../../common/model/ObservableArray.js";
import { cloneDomTemplate } from "../../../common/ui/dom-utils.js";
import { UiRestrictedScreen, UiScreen } from "../../../common/ui/UiScreen.js";
import { Listener } from "../../../common/model/Observable.js";
import { accountSession, LoginState } from "../../../common/model/AccountSession.js";

// TODO: Redirect to login screen if no user is logged in?

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
    }

    onClick() {
        this.screen.requestScreenChange("editor", {presentation: this.presentation.appwriteId});
    }
}

class UiPresentationList {
    constructor(screen) {
        this.screen = screen;
        this.el = this.screen.el.querySelector(".id-presentation-list");

        this.listener = new Listener();

        data.presentationList.presentations.addEventListener(ObservableArray.EVENT_ITEM_ADDED, e => this.onPresentationAdded(e), this.listener);
    }

    terminate() {
        this.listener.terminate();
    }

    onPresentationAdded(e) {
        let presentationItem = new UiPresentationItem(this.screen, e.data.item);
        this.el.appendChild(presentationItem.el);
    }
}

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

class UiDashboardScreen extends UiRestrictedScreen {
    constructor() {
        super("#dashboard-screen-template");
    }

    initRestricted() {
        initData();
        this.presentationList = new UiPresentationList(this);
        this.presentationCreation = new UiPresentationCreation(this);
    }

    terminateRestricted() {
        this.presentationList.terminate();
        terminateData();
    }
}

export { UiDashboardScreen };
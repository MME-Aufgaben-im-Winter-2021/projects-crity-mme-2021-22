import { ObservableArray, appwrite, AccountSession, cloneDomTemplate } from "./common.js";

// TODO: Redirect to login.html if no user is logged in?

class Presentation {
    constructor(appwriteId, title, description) {
        this.appwriteId = appwriteId;
        this.title = title;
        this.description = description;
    }

    static fromAppwritePresentation(appwritePresentation) {
        return new Presentation(
            appwritePresentation.$id,
            appwritePresentation.title,
            appwritePresentation.description);
    }
}

class PresentationList {
    static PRESENTATIONS_COLLECTION_ID = "presentations";

    constructor(accountSession) {
        this.accountSession = accountSession;
        this.presentations = new ObservableArray();

        // TODO: Check if the account session already contains the user data.
        this.accountSession.addEventListener(AccountSession.EVENT_LOGIN_STATE_CHANGED, () => this.onLoginStateChanged());
    }

    onLoginStateChanged() {
        this._fetch();
    }

    async _fetch() {
        let presentations = await appwrite.database.listDocuments(PresentationList.PRESENTATIONS_COLLECTION_ID, [
            Query.equal("author", this.accountSession.accountId),
        ]);

        for (let i = 0; i < presentations.documents.length; i++) {
            let appwritePresentation = presentations.documents[i];
            let presentation = Presentation.fromAppwritePresentation(appwritePresentation);

            this.presentations.push(presentation);
        }
    }

    async createPresentation(title, description) {
        let appwritePresentation = await appwrite.database.createDocument(
            PresentationList.PRESENTATIONS_COLLECTION_ID, 
            "unique()", 
            {author: this.accountSession.accountId, title, description}
        );

        let presentation = Presentation.fromAppwritePresentation(appwritePresentation);

        this.presentations.push(presentation);
    }
}

class DashboardData {
    constructor() {
        this.accountSession = new AccountSession();
        this.presentationList = new PresentationList(this.accountSession);
    }
}

var data = new DashboardData();

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
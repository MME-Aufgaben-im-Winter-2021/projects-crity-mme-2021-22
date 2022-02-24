import { ObservableArray } from "./ObservableArray.js";
import { AccountSession } from "./AccountSession.js";
import { appwrite } from "./appwrite.js";
import { Presentation } from "./Presentation.js";

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

export { PresentationList };
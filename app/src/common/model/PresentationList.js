import { ObservableArray } from "./ObservableArray.js";
import { AccountSession, LoginState } from "./AccountSession.js";
import { appwrite } from "./appwrite.js";
import { Presentation } from "./Presentation.js";
import { Query } from "appwrite";
import { accountSession } from "./AccountSession.js";
import { assert } from "../utils.js";

class PresentationList {
    static PRESENTATIONS_COLLECTION_ID = "presentations";

    constructor() {
        assert(accountSession.loginState === LoginState.LOGGED_IN);

        this.presentations = new ObservableArray();

        this._fetch();
    }

    terminate() {
        this.presentations.terminate();
    }

    async _fetch() {
        let presentations = await appwrite.database.listDocuments(PresentationList.PRESENTATIONS_COLLECTION_ID, [
            Query.equal("author", accountSession.accountId),
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
            {author: accountSession.accountId, title, description}
        );
        
        let presentation = Presentation.fromAppwritePresentation(appwritePresentation);

        this.presentations.push(presentation);
    }
}

export { PresentationList };
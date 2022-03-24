import { ObservableArray } from "./ObservableArray.js";
import { LoginState } from "./AccountSession.js";
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

        this.p_fetch();
    }

    terminate() {
        this.presentations.terminate();
    }

    async p_fetch() {
        let presentations = await appwrite.database.listDocuments(PresentationList.PRESENTATIONS_COLLECTION_ID, [
            Query.equal("author", accountSession.accountId),
        ]);

        for (let i = 0; i < presentations.documents.length; i++) {
            let appwritePresentation = presentations.documents[i],
                presentation = Presentation.fromAppwriteDocument(appwritePresentation);

            this.presentations.push(presentation);
        }
    }

    async createPresentation(title, description) {
        let appwritePresentation = await appwrite.database.createDocument(
                PresentationList.PRESENTATIONS_COLLECTION_ID, 
                "unique()", 
                {author: accountSession.accountId, title, description},
            ),
            presentation = Presentation.fromAppwriteDocument(appwritePresentation);

        this.presentations.push(presentation);
    }
}

export { PresentationList };
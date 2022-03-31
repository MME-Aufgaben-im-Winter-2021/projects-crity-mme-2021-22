import { ObservableArray } from "./ObservableArray.js";
import { LoginState } from "./AccountSession.js";
import { appwrite } from "./appwrite.js";
import { Presentation } from "./Presentation.js";
import { Query } from "appwrite";
import { accountSession } from "./AccountSession.js";
import { assert } from "../utils.js";

// Responsible for querying presentations by their author.
class PresentationList {
    static PRESENTATIONS_COLLECTION_ID = "presentations";

    constructor() {
        assert(accountSession.loginState === LoginState.LOGGED_IN);

        this.presentations = new ObservableArray();

        this.pFetch();
    }

    terminate() {
        this.presentations.terminate();
    }

    async pFetch() {
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

    async getPresentation(appwriteId) {
        let appwritePresentation = await appwrite.database.getDocument(
            PresentationList.PRESENTATIONS_COLLECTION_ID,
            appwriteId,
        );
        return appwritePresentation;
    }

    async updatePresentation(presentation) {
        await appwrite.database.updateDocument(
            PresentationList.PRESENTATIONS_COLLECTION_ID,
            presentation.appwriteId,
            presentation.toAppwriteDocument(),
        );
    }

    async removePresentation(presentation) {
        // TODO: This only removes the presentation document, but we should also remove comments etc.
        // However, I don't think this is possible with the current approach that we have for permissions ...

        await appwrite.database.deleteDocument(
            PresentationList.PRESENTATIONS_COLLECTION_ID,
            presentation.appwriteId,
        );
        this.presentations.remove(presentation);
    }
}

export { PresentationList };
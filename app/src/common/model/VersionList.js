import { Query } from "appwrite";
import { assert } from "../utils.js";
import { accountSession, LoginState } from "./AccountSession.js";
import { appwrite } from "./appwrite.js";
import { Observable, Event } from "./Observable.js";
import { ObservableArray } from "./ObservableArray.js";
import { Version } from "./Version.js";

class VersionList extends Observable {
    static EVENT_INITIAL_FETCH_CONCLUDED = "INITIAL_FETCH_CONCLUDED";

    constructor(presentationId) {
        super();

        assert(accountSession.loginState === LoginState.LOGGED_IN);
        this.presentationId = presentationId;
        this.versions = new ObservableArray();

        (async () => {
            await this.p_fetch();
            this.notifyAll(new Event(VersionList.EVENT_INITIAL_FETCH_CONCLUDED, {}));
        })();
    }

    terminate() {
        this.versions.terminate();
    }

    async p_fetch() {
        let presentationId = this.presentationId,
            presentationVersions = await appwrite.database.listDocuments("presentationVersions", [
                Query.equal("presentation", presentationId),
            ]);

        for (let i = 0; i < presentationVersions.documents.length; i++) {
            let presentationVersion = presentationVersions.documents[i],
                label = presentationVersion.label,
                storageFileId = presentationVersion.storageFile,
                pdfUrl = await appwrite.storage.getFileDownload(storageFileId),
                version = new Version(label, pdfUrl, presentationVersion.$id);

            this.versions.push(version);
        }
    }

    async createVersion(presentationId, label, file) {
        let storageFile = await appwrite.storage.createFile(
                "unique()",
                file, 
                ["role:all"], 
                ["role:all"]),
            appwriteVersion = await appwrite.database.createDocument("presentationVersions", "unique()", {label, storageFile: storageFile.$id, presentation: presentationId}),
            storageFileId = storageFile.$id,
            pdfUrl = await appwrite.storage.getFileDownload(storageFileId),
            version = new Version(label, pdfUrl, appwriteVersion.$id);

        this.versions.push(version);

        return version;
    }
}

export { VersionList };
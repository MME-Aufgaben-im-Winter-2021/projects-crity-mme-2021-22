import { ObservableArray } from "../../../common/model/ObservableArray.js";
import { Observable, Event } from "../../../common/model/Observable.js";
import { appwrite } from "../../../common/model/appwrite.js";
import { ActivePdf } from "./ActivePdf.js";
import { AccountSession } from "../../../common/model/AccountSession.js";
import { Version } from "./Version.js";

// The global object representing all the abstract state of the tab.
class EditorData extends Observable {
    // Events {

    // Someone set a new active PDF and it is ready.
    // >> `pdfUrl`: The (shortened) URL of the PDF that was loaded.
    static EVENT_PDF_LOADED = "PDF_LOADED";

    // Someone set a new active version.
    // >> `version`: The new active #Version.
    static EVENT_ACTIVE_VERSION_CHANGED = "ACTIVE_VERSION_CHANGED";

    // }

    constructor() {
        super();

        // TODO: Having an active PDF and an active version seems redundant, revisit this.
        this.activePdf = null;

        this.activeVersion = null;
        this.versions = new ObservableArray();

        let urlSearchParams = new URLSearchParams(window.location.search);
        this.presentationId = urlSearchParams.get("presentation");

        this.accountSession = new AccountSession();
        this.accountSession.addEventListener(AccountSession.EVENT_LOGIN_STATE_CHANGED, () => this.onLoginStateChanged());
    }

    
    setVersion(version) {
        if (this.activeVersion === version) {
            return;
        }
        
        this.activeVersion = version;
        this.notifyAll(new Event(EditorData.EVENT_ACTIVE_VERSION_CHANGED, {version}));
        
        (async () => {
            let storageFileId = version.pdfUrl;
            
            let storageFile = await appwrite.storage.getFile(storageFileId);
            let storageFileUrl = await appwrite.storage.getFileDownload(storageFileId);
            
            await this.loadPdf(storageFileUrl.href);
        })();
    }
    
    async loadPdf() {
        let version = this.activeVersion;
        let loadingTask = pdfjsLib.getDocument(version.pdfUrl);
        let pdfJsPdf = await loadingTask.promise;
        
        // Method to close the CommentUpdate for the old Version
        if(this.activePdf !== null) {
            this.activePdf.activePageComments.closeSubscription();
        }
        this.activePdf = new ActivePdf(version, pdfJsPdf);
        this.notifyAll(new Event(EditorData.EVENT_PDF_LOADED, {pdfUrl: version.pdfUrl}));

        // TODO: Check if the PDF is empty.
        this.activePdf.setActivePage(1);
    }

    addVersion(version) {
        this.versions.push(version);
    }

    hasPdf() {
        return this.activePdf !== null;
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // DB-related stuff
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
    onLoginStateChanged() {
        this.fetchVersions();
    }

    async createPresentationVersion(presentationId, label, file) {
        let storageFile = await appwrite.storage.createFile(
            "unique()",
            file, 
            ["role:all"], 
            ["role:all"]);

        console.log("storageFile", storageFile);

        let appwriteVersion = await appwrite.database.createDocument("presentationVersions", "unique()", {label, storageFile: storageFile.$id, presentation: presentationId});

        let storageFileId = storageFile.$id;
        let pdfUrl = await appwrite.storage.getFileDownload(storageFileId);

        let version = new Version(label, pdfUrl, appwriteVersion.$id);

        this.addVersion(version);
        this.setVersion(this.versions.getLast());
    }

    async loadLoginData() {
        // File upload always fails without a session.
        let alreadyLoggedIn = await this.checkIfLoggedIn();

        let account = await appwrite.account.get();
        console.log(account);
    }

    async fetchVersions() {
        let urlSearchParams = new URLSearchParams(window.location.search);

        let presentationId = this.presentationId;
        console.log(presentationId);

        let presentation = await appwrite.database.getDocument("presentations", presentationId);
        console.log("loaded presentation", presentation);

        let presentationVersions = await appwrite.database.listDocuments("presentationVersions", [
            Query.equal("presentation", presentationId)
        ]);

        for (let i = 0; i < presentationVersions.documents.length; i++) {
            let presentationVersion = presentationVersions.documents[i];

            let label = presentationVersion.label;

            let storageFileId = presentationVersion.storageFile;
            let pdfUrl = await appwrite.storage.getFileDownload(storageFileId);

            let version = new Version(label, pdfUrl, presentationVersion.$id);

            this.addVersion(version);
        }
        
        this.setVersion(this.versions.getLast());
    }
}

var data = new EditorData();
export {EditorData, data};
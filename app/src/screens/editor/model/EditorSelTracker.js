import { Observable, Event, Listener } from "../../../common/model/Observable.js";
import { VersionPdf } from "../../../common/model/VersionPdf.js";

// Track the active version and page. 
// TODO: Probably too broad, especially once we need to select comments etc.

class EditorSelTracker extends Observable {
    // Someone set a new active version.
    // >> `version`: The new active #Version.
    static EVENT_ACTIVE_VERSION_CHANGED = "ACTIVE_VERSION_CHANGED";

    // The "active" page changed. 
    // >> `pageNo`: The number of the page that _became_ active. 
    static EVENT_ACTIVE_PAGE_CHANGED = "ACTIVE_PAGE_CHANGED";

    constructor() {
        super();

        this.listener = new Listener();
        this.version = null;
        this.pdf = null;
        // TODO: Should this be tracked by a separate class?
        this.activePageNo = null;
        this.activePage = null;
    }

    terminate() {
        this.listener.terminate();
        this.pdf?.terminate();
    }
    
    activateVersion(version) {
        if (this.version === version) {
            return;
        }

        this.pdf?.terminate();
        
        this.version = version;
        this.activePageNo = null;

        this.pdf = new VersionPdf(version);
        // TODO: Check if the PDF is empty.
        this.pdf.addEventListener(VersionPdf.EVENT_PDF_LOADED, () => this.activatePage(1), this.listener);

        this.notifyAll(new Event(EditorSelTracker.EVENT_ACTIVE_VERSION_CHANGED, {version}));
    }

    // TODO: Leaving this (porting), but seems a bit weird now, revisit this.
    hasPdf() {
        return this.pdf !== null;
    }

    async activatePage(pageNo) {
        if (this.activePageNo === pageNo) {
            return;
        }

        this.activePageNo = pageNo;
        this.activePage = await this.pdf.fetchPage(pageNo);
        this.notifyAll(new Event(EditorSelTracker.EVENT_ACTIVE_PAGE_CHANGED, {pageNo}));
    }
}

export { EditorSelTracker };
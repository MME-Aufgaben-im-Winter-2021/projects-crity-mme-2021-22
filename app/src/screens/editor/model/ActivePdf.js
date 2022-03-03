import { Observable, Event } from "../../../common/model/Observable.js";
import { PageComments } from "./PageComments.js";
import { PdfPage } from "./PdfPage.js";

// TODO: Do we want to merge this with the Version class, seeing as there is a
// one-to-one correspondence between PDFs and versions? On the other hand,
// a version should probably not always have the PDF locked and loaded ...
// TODO: Make this something more generic and put it into common, e.g.
// LoadedPDF?
//
// Wraps PDFJS's PDFDocumentProxy.
//
// We maintain the notion of an "active" page number.
// This is the page that is visible in the viewer and where the
// comments are taken from.
//
// The first page has pageNo _1_(not 0)! This is to keep things consistent
// with PDFJS.
class ActivePdf extends Observable {
    // Events {

    // The "active" page changed. 
    // >> `pageNo`: The number of the page that _became_ active. 
    static EVENT_ACTIVE_PAGE_CHANGED = "ACTIVE_PAGE_CHANGED";

    // }

    constructor(version, pdfJsPdf) {
        super();

        this.version = version;
        this.pdfJsPdf = pdfJsPdf;
        this.activePageNo = null;

        this.activePageComments = new PageComments(version);

        // Not sure how expensive it is to access the # pages, let's store this ourselves to be on the safe side.
        this.numPages = pdfJsPdf.numPages;
    }

    terminate() {
        super.terminate();
        this.activePageComments.terminate();
    }

    setActivePage(pageNo) {
        if (this.activePageNo === pageNo) {
            return;
        }

        this.activePageNo = pageNo;
        this.notifyAll(new Event(ActivePdf.EVENT_ACTIVE_PAGE_CHANGED, {pageNo}));
        
        this.activePageComments.setActivePage(this.activePageNo);
    }

    // Asynchronously fetch the PdfPage corresponding to the page number.
    async fetchPage(pageNo) {
        let page = await this.pdfJsPdf.getPage(pageNo);
        let activePdfPage = new PdfPage(page);
        return activePdfPage;
    }
}

export { ActivePdf };
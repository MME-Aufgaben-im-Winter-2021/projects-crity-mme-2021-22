import { Observable, Event } from "./Observable.js";
import { PdfPage } from "./PdfPage.js";
import * as pdfjsLib from "pdfjs-dist/webpack.js";

// Wraps PDFJS's PDFDocumentProxy.
//
// We maintain the notion of an "active" page number.
// This is the page that is visible in the viewer and where the
// comments are taken from.
//
// The first page has pageNo _1_(not 0)! This is to keep things consistent
// with PDFJS.
class VersionPdf extends Observable {
    // Events {

    // The PDF is ready.
    // >> `pdfUrl`: The (shortened) URL of the PDF that was loaded.
    static EVENT_PDF_LOADED = "PDF_LOADED";

    // }

    constructor(version) {
        super();

        this.version = version;

        this.pdfJsPdf = null;
        this.numPages = null;

        this.p_fetch();
    }

    async p_fetch() {
        this.pdfJsPdf = await pdfjsLib.getDocument(this.version.pdfUrl).promise;

        // Not sure how expensive it is to access the # of pages, let's store this ourselves to be on the safe side.
        this.numPages = this.pdfJsPdf.numPages;
        
        this.notifyAll(new Event(VersionPdf.EVENT_PDF_LOADED, {pdfUrl: this.version.pdfUrl}));
    }

    // Asynchronously fetch the PdfPage corresponding to the page number.
    async fetchPage(pageNo) {
        let page = await this.pdfJsPdf.getPage(pageNo),
            activePdfPage = new PdfPage(page);
        return activePdfPage;
    }
}

export { VersionPdf };
// At the moment, this is just a thin wrapper that sits on PDFJS's PDFPageProxy
class PdfPage {
    constructor(pdfJsPage) {
        this.pdfJsPage = pdfJsPage;

        // This represents general information about page measurements.
        // We mainly use this to get the page width/height.
        this.viewport = pdfJsPage.getViewport({scale: 1});
    }

    get asp() {
        return this.viewport.width / this.viewport.height;
    }
}

export { PdfPage };
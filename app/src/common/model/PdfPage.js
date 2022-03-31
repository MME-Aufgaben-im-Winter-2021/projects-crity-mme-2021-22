// At the moment, this is just a thin wrapper that sits on PDFJS's PDFPageProxy
// Represents a single page. This class is not only important to render the page,
// we also use it when we need to work with what we call "PDF.JS-coordinates", see
// the comment in ViewingArea for more details about coordinates.
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
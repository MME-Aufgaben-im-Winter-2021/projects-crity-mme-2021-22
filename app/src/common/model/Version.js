// Stores version-related metadata, as opposed to VersionPdf which downloads the PDF.
class Version {
    constructor(label, pdfUrl, appwriteId) {
        this.label = label;
        this.pdfUrl = pdfUrl;
        this.appwriteId = appwriteId;
    }
}

export { Version };
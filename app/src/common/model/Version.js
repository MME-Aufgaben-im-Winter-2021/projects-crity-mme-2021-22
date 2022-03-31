// Client-side representation of the documents in the presentationVersions collection.
// Stores version-related metadata, as opposed to VersionPdf which downloads the PDF allows accessing
// it.
// To represent the tree-structure, every version keeps the ID of its "parent" (previousVersion).
class Version {
    constructor(label, pdfUrl, appwriteId, previousVersion) {
        this.label = label;
        this.pdfUrl = pdfUrl;
        this.appwriteId = appwriteId;
        this.previousVersion = previousVersion;
    }
}

export { Version };
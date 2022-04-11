import { appwrite } from "../model/appwrite.js";

// Client-side representation of the documents in the presentationVersions collection.
// Stores version-related metadata, as opposed to VersionPdf which downloads the PDF allows accessing
// it.
// To represent the tree-structure, every version keeps the ID of its "parent" (previousVersion).
class Version {
    constructor(label, pdfUrl, appwriteId, presentation, previousVersion, commentsChecked) {
        this.label = label;
        this.pdfUrl = pdfUrl;
        this.appwriteId = appwriteId;
        this.previousVersion = previousVersion;
        this.presentation = presentation;
        this.commentsChecked = commentsChecked;
    }

    async setCheckedArray(idToAdd) {
        let index = this.commentsChecked.indexOf(idToAdd);
        if(index !== -1) {
            this.commentsChecked.splice(index, 1);
        }else{
            this.commentsChecked.push(idToAdd);
        }
        
        await appwrite.database.updateDocument(
            "presentationVersions",
            this.appwriteId,
            {commentsChecked: this.commentsChecked},
        );
    }
}

export { Version };
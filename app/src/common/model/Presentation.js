class Presentation {
    constructor(appwriteId, title, description) {
        this.appwriteId = appwriteId;
        this.title = title;
        this.description = description;
    }

    static fromAppwriteDocument(appwritePresentation) {
        return new Presentation(
            appwritePresentation.$id,
            appwritePresentation.title,
            appwritePresentation.description);
    }
}

export { Presentation };
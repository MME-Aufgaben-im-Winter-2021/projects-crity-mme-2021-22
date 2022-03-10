// WARNING: ALWAYS make sure to import this! Apparently, the Web APIs already
// have a Comment class, which will be created if you forget the import!

class Comment {
    constructor(author, text) {
        this.author = author;
        this.text = text;
    }

    static fromAppwriteDocument(appwriteComment) {
        return new Comment(appwriteComment.author, appwriteComment.text);
    }
}

export { Comment };
import { appwrite } from "./appwrite.js";

// WARNING: ALWAYS make sure to import Comment.js! Apparently, the Web APIs already
// have a Comment class, which will be created if you forget the import!
class Comment {
    constructor(author, text, likes, subComments) {
        this.author = author;
        this.text = text;
        this.likes = likes;
        this.subComments = subComments;
    }

    static fromAppwriteDocument(appwriteComment, subComments) {
        return new Comment(appwriteComment.author, appwriteComment.text, appwriteComment.likes, subComments);
    }

    async submit() {
        return await appwrite.database.createDocument("comments", "unique()", { text: this.text, author: this.author });
    }
}

export { Comment };
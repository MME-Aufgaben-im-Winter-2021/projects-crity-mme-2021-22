import { appwrite } from "./appwrite.js";

// WARNING: ALWAYS make sure to import Comment.js! Apparently, the Web APIs already
// have a Comment class, which will be created if you forget the import!

// Client-side representation of the documents in the "comments" collection.
// A comment, also known as a thread. A thread can have multiple sub-comments.
// TODO: Eliminate the inconsistent nomenclature.
// Very closely tied to VersionComment, see there for an explanation of the distinction.
class Comment {
    constructor(author, text, subComments, votes) {
        this.author = author;
        this.text = text;
        this.votes = votes;
        this.subComments = subComments;
    }

    static fromAppwriteDocument(appwriteComment, subComments, votes) {
        return new Comment(appwriteComment.author, appwriteComment.text, subComments, votes);
    }

    async submit() {
        return await appwrite.database.createDocument("comments", "unique()", { text: this.text, author: this.author });
    }
}

export { Comment };
import { appwrite } from "./appwrite.js";
import { Comment } from "./Comment.js";
import { Observable, Event } from "./Observable.js";

class VersionComment extends Observable {
    // TODO: Is there a better place for this? Should we add constants for _all_ collection IDs?
    static VERSION_COMMENT_COLLECTION_ID = "6214e5ef06bef7005816";

    static EVENT_PAGE_POS_CHANGED = "PAGE_POS_CHANGED";

    constructor(version, pageNo, comment, pageX, pageY, commentId) {
        super();

        this.version = version;
        this.pageNo = pageNo;

        this.comment = comment;
        this.pageX = pageX;
        this.pageY = pageY;

        this.id = commentId;
    }

    static async fromAppwriteDocument(version, appwriteVersionComment) {
        let appwriteComment = await appwrite.database.getDocument("comments", appwriteVersionComment.comment),
            comment = Comment.fromAppwriteDocument(appwriteComment);
        return new VersionComment(version, appwriteVersionComment.pageNo, comment, appwriteVersionComment.xOnPage, appwriteVersionComment.yOnPage, appwriteVersionComment.comment);
    }

    setPagePos(pageX, pageY) {
        this.pageX = pageX;
        this.pageY = pageY;

        this.notifyAll(new Event(VersionComment.EVENT_PAGE_POS_CHANGED, {}));
    }

    async submit() {
        let appwriteComment, appwriteVersionComment;

        // Create an entry in the comments collection.
        // This data is supposed to be shared across all versions that contain this comment.
        appwriteComment = await this.comment.submit();

        // Create an entry in the version-comment collection.
        // This is supposed to contain version-specific data related to a given comment.
        appwriteVersionComment = await appwrite.database.createDocument(
            VersionComment.VERSION_COMMENT_COLLECTION_ID,
            "unique()", 
            {
                presentationVersion: this.version.appwriteId,
                pageNo: this.pageNo,
                xOnPage: this.pageX,
                yOnPage: this.pageY,
                comment: appwriteComment.$id,
            },
        );

        return appwriteVersionComment;
    }

    async submitComment(author, message) {
        this.comment.authors.push(author);
        this.comment.messages.push(message);
        let appwriteComment = await appwrite.database.updateDocument("comments", this.id, {
            authors: this.comment.authors,
            messages: this.comment.messages,
        })
    }
}

export { VersionComment };
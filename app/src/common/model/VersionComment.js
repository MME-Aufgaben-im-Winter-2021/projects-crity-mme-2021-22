import { appwrite } from "./appwrite.js";
import { Comment } from "./Comment.js";
import { Observable, Event } from "./Observable.js";
import { accountSession } from "./AccountSession.js";
import { Query } from "appwrite";

class VersionComment extends Observable {
    // TODO: Is there a better place for this? Should we add constants for _all_ collection IDs?
    // These are instances of Threads, just one!
    static VERSION_COMMENT_COLLECTION_ID = "6214e5ef06bef7005816";
    static THREAD_COMMENT_COLLECTION_ID = "6241d36259cb4d652b9f";

    static EVENT_PAGE_POS_CHANGED = "PAGE_POS_CHANGED";
    static EVENT_SELECTED = "SELECTED";

    constructor(version, pageNo, comment, pageX, pageY, commentId) {
        super();

        this.version = version;
        this.pageNo = pageNo;

        this.comment = comment;
        this.pageX = pageX;
        this.pageY = pageY;

        this.id = commentId;

        this.uiComment = null;
    }

    static async fromAppwriteDocument(version, appwriteVersionComment) {
        let appwriteComment = await appwrite.database.getDocument("comments", appwriteVersionComment.comment);
        let appwriteSubComments = await appwrite.database.listDocuments(VersionComment.THREAD_COMMENT_COLLECTION_ID, [Query.equal("commentId", appwriteVersionComment.comment)]);
        let subComments = [];
        for (let i = 0; i < appwriteSubComments.documents.length; i++) {   
            let appwriteSubComment = appwriteSubComments.documents[i];
            subComments.push({ message: appwriteSubComment.message, author: appwriteSubComment.author });
        }
        let comment = Comment.fromAppwriteDocument(appwriteComment, subComments);
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
        this.comment.subComments.push({ message: message, author: author });
        await appwrite.database.createDocument(
            "6241d36259cb4d652b9f",
            "unique()",
            {
                author: author,
                message: message,
                commentId: this.id,
            },
        );
    }

    async changeLikeStatus(liked, uiComment) {
        let appwriteComment = await appwrite.database.getDocument("comments", this.id),
            comment = Comment.fromAppwriteDocument(appwriteComment);
        if(liked) {
            comment.likes.push(accountSession.accountId);
        }else{
            comment.likes.splice(accountSession.accountId, 1);
        }
        this.comment.likes = comment.likes;
        appwriteComment = await appwrite.database.updateDocument("comments", this.id, {
            likes: comment.likes,
        });
        uiComment.likesChanged(comment.likes);
    }

    commentOpened() {
        this.notifyAll(new Event(VersionComment.EVENT_SELECTED, {open: true}));
    }

    commentClosed() {
        this.notifyAll(new Event(VersionComment.EVENT_SELECTED, {open: false}));
    }

    registerUiComment(uiComment) {
        this.uiComment = uiComment;
    }

    commentUpdate(subComment) {
        this.comment.subComments.push({ message: subComment.message, author: subComment.author });
        this.uiComment.addComment(subComment.author, subComment.message);
    }
}

export { VersionComment };
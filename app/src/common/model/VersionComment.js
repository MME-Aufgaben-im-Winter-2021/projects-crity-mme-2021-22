import { appwrite } from "./appwrite.js";
import { Comment } from "./Comment.js";
import { Observable, Event } from "./Observable.js";
import { accountSession } from "./AccountSession.js";

class VersionComment extends Observable {
    // TODO: Is there a better place for this? Should we add constants for _all_ collection IDs?
    static VERSION_COMMENT_COLLECTION_ID = "6214e5ef06bef7005816";

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
        console.log(this.comment.authors);
        console.log(this.comment.messages);
        await appwrite.database.updateDocument("comments", this.id, {
            authors: this.comment.authors,
            messages: this.comment.messages,
        });
    }

    subscribeToCommentDocument(uiComment) {  
        let id = 'documents.'+this.id;  
        this.unsubscribeFunc = appwrite.subscribe(
            id,
            response => this.onDocumentChanged(response, uiComment),
        );   
    }

    async onDocumentChanged(response, uiComment) {
        console.log(response);
        this.comment.authors = response.payload.authors;
        this.comment.messages = response.payload.messages;
        console.log(this.comment.authors);
        uiComment.addComment(this.comment.authors[this.comment.authors.length-1], this.comment.messages[this.comment.messages.length-1]);
    }

    async loadNewestComments(uiComment) {
        let appwriteComment = await appwrite.database.getDocument("comments", this.id),
            comment = Comment.fromAppwriteDocument(appwriteComment);
        if(this.comment.authors.length !== comment.authors.length) {
            this.comment = comment;
            uiComment.addComments(comment);
        }
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
}

export { VersionComment };
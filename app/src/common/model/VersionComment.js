import { appwrite } from "./appwrite.js";
import { Comment } from "./Comment.js";
import { Observable, Event } from "./Observable.js";
import { accountSession } from "./AccountSession.js";
import { Query } from "appwrite";

// VersionComment: Ties a comment to a version. Our initial plan was to have one comment show up in multiple
// versions, hence the distinction in the code.
// The client-side representation of the commentVersions collection.
// TODO: Some of the stuff in here is conceptually more related to Comment, e.g. tracking votes. But since
// we no longer plan to have per-version comments this distinction is getting artificial anyway ...
class VersionComment extends Observable {
    // TODO: Is there a better place for this? Should we add constants for _all_ collection IDs?
    // These are instances of Threads, just one!
    static VERSION_COMMENT_COLLECTION_ID = "6214e5ef06bef7005816";
    static THREAD_COMMENT_COLLECTION_ID = "6241d36259cb4d652b9f";
    static THREAD_VOTES_COLLECTION_ID = "6214e708a17a5ac6fa84";

    static EVENT_PAGE_POS_CHANGED = "PAGE_POS_CHANGED";

    // TODO: Tracking selection is kind of specific to the editor, and not a property of the VersionComment itself ...
    static EVENT_SELECTION_STATE_CHANGED = "SELECTION_STATE_CHANGED";

    constructor(version, pageNo, comment, pageX, pageY, commentId) {
        super();

        this.version = version;
        this.pageNo = pageNo;

        this.comment = comment;

        // Relative page coordinates, see ViewingArea.
        this.pageX = pageX;
        this.pageY = pageY;

        this.id = commentId;

        this.uiComment = null;

        this.selected = false;
    }

    static async fromAppwriteDocument(version, appwriteVersionComment) {
        let appwriteComment, appwriteSubComments, subComments, appwriteThreadVotes, votes, comment;

        appwriteComment = await appwrite.database.getDocument("comments", appwriteVersionComment.comment);
        appwriteSubComments = await appwrite.database.listDocuments(VersionComment.THREAD_COMMENT_COLLECTION_ID, [Query.equal("commentId", appwriteVersionComment.comment)]);
        subComments = [];
        for (let i = 0; i < appwriteSubComments.documents.length; i++) {   
            let appwriteSubComment = appwriteSubComments.documents[i];
            subComments.push({ message: appwriteSubComment.message, author: appwriteSubComment.author });
        }
        appwriteThreadVotes = await appwrite.database.listDocuments(VersionComment.THREAD_VOTES_COLLECTION_ID, [Query.equal("threadId", appwriteVersionComment.comment)]);
        votes = [];
        for (let i = 0; i < appwriteThreadVotes.documents.length; i++) {   
            let appwriteVote = appwriteThreadVotes.documents[i];
            votes.push(appwriteVote.userId);
        }
        comment = Comment.fromAppwriteDocument(appwriteComment, subComments, votes);
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

    // Create an SubComment Entry
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

    async changeVoteStatus(voted, uiComment) {
        if(voted) {
            this.comment.votes.push(accountSession.accountId);
            await appwrite.database.createDocument(
                "6214e708a17a5ac6fa84",
                "unique()",
                {
                    userId: accountSession.accountId,
                    threadId: this.id,
                },
            );
        }else{
            this.comment.votes.splice(accountSession.accountId, 1);
            let myVoteDocument = await appwrite.database.listDocuments("6214e708a17a5ac6fa84", [Query.equal("userId", accountSession.accountId), Query.equal("threadId",this.id)]);
            await appwrite.database.deleteDocument("6214e708a17a5ac6fa84", myVoteDocument.documents[0].$id);
        }

        uiComment.votesChanged(this.comment.votes);
    }

    setSelected() {
        this.selected = true;
        this.notifyAll(new Event(VersionComment.EVENT_SELECTION_STATE_CHANGED, {open: true}));
    }

    unsetSelected() {
        this.selected = false;
        this.notifyAll(new Event(VersionComment.EVENT_SELECTION_STATE_CHANGED, {open: false}));
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
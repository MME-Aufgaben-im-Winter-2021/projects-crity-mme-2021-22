import { ObservableArray } from "../../../common/model/ObservableArray.js";
import { appwrite } from "../../../common/model/appwrite.js";
import { Comment } from "./Comment.js";
import { Query } from "appwrite";

class PageComments {
    // TODO: Is there a better place for this? Should we add constants for _all_ collection IDs?
    static COMMENT_VERSION_COLLECTION_ID = "6214e5ef06bef7005816";

    constructor(version) {
        this.version = version;
        this.comments = new ObservableArray();
        this.pageNo = null;
        this.subscribeToCommentsVersionCollections();
    }

    terminate() {
        this.comments.terminate();
        this.closeSubscription();
    }

    // Fetch comments for the active page.
    setActivePage(pageNo) {
        this.pageNo = pageNo;
        this.p_fetchComments();
    }

    async p_fetchComments() {
        this.comments.clear();

        let presentationVersionId = this.version.appwriteId,
            commentVersions = await appwrite.database.listDocuments(PageComments.COMMENT_VERSION_COLLECTION_ID, [
            Query.equal("presentationVersion", presentationVersionId),
            Query.equal("pageNo", this.pageNo),
        ]);

        for (let i = 0; i < commentVersions.documents.length; i++) {
            let commentVersion = commentVersions.documents[i],
                appwriteComment = await appwrite.database.getDocument("comments", commentVersion.comment),
                comment = new Comment(appwriteComment.author, appwriteComment.text);
            this.comments.push(comment);
        }
    }

    async subscribeToCommentsVersionCollections() {
        this.unsubscribe = appwrite.subscribe("collections.6214e5ef06bef7005816.documents", response => {
            this.p_updateComments(response);
        });
    }

    closeSubscription() {
        this.unsubscribe();
    }

    async p_updateComments(response){
        if(response.payload.presentationVersion === this.version.appwriteId && response.payload.pageNo === this.pageNo){
            let appwriteComment = await appwrite.database.getDocument("comments", response.payload.comment),
                comment = new Comment(appwriteComment.author, appwriteComment.text);
            this.comments.push(comment);
        }
    }

    createComment(comment) {
        /*
        (async () => {
            // First creating an entry in commentVersions
            let appwriteComment = await appwrite.database.createDocument(
                "comments", 
                "unique()", 
                {text: comment.text, author: comment.author});

            // Second creating an entry in comments
            await appwrite.database.createDocument(
                PageComments.COMMENT_VERSION_COLLECTION_ID, 
                "unique()", 
                {presentationVersion: this.version.appwriteId, pageNo: this.pageNo, xOnPage: 0.0, yOnPage: 0.0, comment: appwriteComment.$id});
        })();
        */

        let json = JSON.stringify([comment.text, comment.author]);
        let promise = appwrite.functions.createExecution('uberFunc', json);
        
        promise.then(function (response) {
            console.log(response); // Success
        }, function (error) {
            console.log(error); // Failure
        });
    }
}

export { PageComments };
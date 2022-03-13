import { ObservableArray } from "../../../common/model/ObservableArray.js";
import { appwrite } from "../../../common/model/appwrite.js";
import { Comment } from "./Comment.js";
import { Thread } from "../ui/threads/Thread.js";
import { Query } from "appwrite";

class PageComments {
    // TODO: Is there a better place for this? Should we add constants for _all_ collection IDs?
    static COMMENT_VERSION_COLLECTION_ID = "6214e5ef06bef7005816";
    static THREADS_COLLECTION_ID = "6214e528bca5bb1da956";

    constructor(version) {
        this.version = version;

        this.threads = new ObservableArray();
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
        this.p_fetchThreads();
        //this.p_fetchComments();
    }

    async p_fetchThreads() {
        this.threads.clear();

        
        let presentationVersionId = this.version.appwriteId;
        console.log(presentationVersionId);
        console.log(this.pageNo);
        let threads = await appwrite.database.listDocuments(PageComments.THREADS_COLLECTION_ID, [
            Query.equal("presentationVersion", presentationVersionId),
            Query.equal("pageNo", this.pageNo),
        ]);

        console.log(threads.documents.length);
        for (let i = 0; i < threads.documents.length; i++) {
            let appwriteThread = threads.documents[i];
            let thread = new Thread(appwriteThread.author, appwriteThread.title);
            this.threads.push(thread);
        }
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

    createThread(comment) {
        (async () => {
            //New Thread-Collection Document
            let appwriteThread = await appwrite.database.createDocument(
                "6214e528bca5bb1da956",
                "unique()",
                {title: comment.text, author: comment.author, presentationVersion: this.version.appwriteId, pageNo: this.pageNo}
            );
        })();
    }

    createComment(comment) {
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
    }
}

export { PageComments };
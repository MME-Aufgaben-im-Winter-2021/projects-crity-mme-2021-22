import { Query } from "appwrite";
import { appwrite } from "./appwrite.js";
import { ObservableArray } from "./ObservableArray.js";
import { VersionComment } from "./VersionComment.js";

// Responsible for tracking comments that match a certain query. Keep this generic and put the editor-specific code
// in the editor model.
class VersionCommentQuery {
    // TODO: Unless if I messed up this should return the comments for *all* pages of the version, but yours truly didn't test.
    static PAGE_NO_ANY = "PAGE_NO_ANY";

    constructor(version, pageNo) {
        this.version = version;
        this.pageNo = pageNo;

        // Fill this with the query results.
        this.versionComments = new ObservableArray();
        this.versionCommentsNormalArray = [];
        this.subscribeToCommentsVersionCollections();
        this.subscribeToThreadCommentsCollection();

        this.p_fetch();
    }
    
    // TODO: Might want to wrap Appwrite's subscription mechanisms to make use of our Observable infrastructure?
    // TODO: Listening to collection events is not feasible on production scale.
    subscribeToCommentsVersionCollections() {
        this.unsubscribeFunc = appwrite.subscribe(
            `collections.${VersionComment.VERSION_COMMENT_COLLECTION_ID}.documents`, 
            response => this.onVersionCommentCollectionChanged(response),
        );
    }

    subscribeToThreadCommentsCollection() {
        this.unsubscribeFuncTwo = appwrite.subscribe(
            `collections.${"6241d36259cb4d652b9f"}.documents`, 
            response => this.onThreadCollectionChanged(response),
        );
    }

    appwriteVersionCommentMatchesQuery(appwriteVersionComment) {
        if (appwriteVersionComment.presentationVersion !== this.version.appwriteId) {
            return false;
        }

        if (this.pageNo !== VersionCommentQuery.PAGE_NO_ANY && appwriteVersionComment.pageNo !== this.pageNo) {
            return false;
        }

        return true;
    }

    async onVersionCommentCollectionChanged(response) {
        if (this.appwriteVersionCommentMatchesQuery(response.payload)) {
            let versionComment = await VersionComment.fromAppwriteDocument(this.version, response.payload);
            this.versionComments.push(versionComment);
            this.versionCommentsNormalArray.push(versionComment);
        }
    }

    async onThreadCollectionChanged(response) {
        console.log(this.versionCommentsNormalArray.length);
        this.versionCommentsNormalArray.find(obj => { return obj.id === response.payload.commentId}).commentUpdate(response.payload);
        
    }

    terminate() {
        this.versionComments.terminate();
        this.unsubscribeFunc();
        this.unsubscribeFuncTwo();
    }

    buildAppwriteQueryArray() {
        let queries = [Query.equal("presentationVersion", this.version.appwriteId)];
        if (this.pageNo !== VersionCommentQuery.PAGE_NO_ANY) {
            queries.push(Query.equal("pageNo", this.pageNo));
        }
        return queries;
    }

    async p_fetch() {
        this.versionComments.clear();

        // Do the query.
        let appwriteVersionComments = await appwrite.database.listDocuments(VersionComment.VERSION_COMMENT_COLLECTION_ID, this.buildAppwriteQueryArray());

        // Feed the result into our observable array.
        for (let i = 0; i < appwriteVersionComments.documents.length; i++) {
            // Without the asynchronous function, every comment HTTP request would have to wait for its
            // predecessor's roundtrip to finish, which slows comment loading down severely.
            // FIXME: This messes up the order of the comments.
            //(async () => {
                let appwriteVersionComment = appwriteVersionComments.documents[i],
                    versionComment = await VersionComment.fromAppwriteDocument(this.version, appwriteVersionComment);
                this.versionComments.push(versionComment);
                this.versionCommentsNormalArray.push(versionComment);
            //})();
        }
    }
}

export { VersionCommentQuery };
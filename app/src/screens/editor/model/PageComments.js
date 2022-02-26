import { ObservableArray } from "../../../common/model/ObservableArray.js";
import { appwrite } from "../../../common/model/appwrite.js";
import { Comment } from "./Comment.js";

class PageComments {
    // TODO: Is there a better place for this? Should we add constants for _all_ collection IDs?
    static COMMENT_VERSION_COLLECTION_ID = "6214e5ef06bef7005816";

    constructor(version) {
        this.version = version;
        this.comments = new ObservableArray();
        this.pageNo = null;
    }

    // Fetch comments for the active page.
    setActivePage(pageNo) {
        this.pageNo = pageNo;
        this._fetchComments();
    }

    async _fetchComments() {
        this.comments.clear();

        let presentationVersionId = this.version.appwriteId;

        let commentVersions = await appwrite.database.listDocuments(PageComments.COMMENT_VERSION_COLLECTION_ID, [
            Query.equal("presentationVersion", presentationVersionId),
            Query.equal("pageNo", this.pageNo)
        ]);

        for (let i = 0; i < commentVersions.documents.length; i++) {
            let commentVersion = commentVersions.documents[i];

            let appwriteComment = await appwrite.database.getDocument("comments", commentVersion.comment);
            let comment = new Comment(appwriteComment.author, appwriteComment.text);
            this.comments.push(comment);
        }
    }

    createComment(comment) {
        this.comments.push(comment);

        (async () => {
            let appwriteComment = await appwrite.database.createDocument("comments", "unique()", {text: comment.text, author: comment.author});

            await appwrite.database.createDocument(
                PageComments.COMMENT_VERSION_COLLECTION_ID, 
                "unique()", 
                {presentationVersion: this.version.appwriteId, pageNo: this.pageNo, xOnPage: 0.0, yOnPage: 0.0, comment: appwriteComment.$id});
        })();
    }
}

export { PageComments };
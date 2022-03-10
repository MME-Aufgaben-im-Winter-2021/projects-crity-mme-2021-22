import { Observable, Event, Listener } from "../../../common/model/Observable.js";
import { appwrite } from "../../../common/model/appwrite.js";
import { VersionList } from "../../../common/model/VersionList.js";
import { EditorSelTracker } from "./EditorSelTracker.js";
import { VersionCommentQuery } from "../../../common/model/VersionCommentQuery.js";

var data;

function initData(presentationId) {
    data = new EditorData(presentationId);
}

function terminateData() {
    data.terminate();
    data = null;
}

// We have the following hierarchy of selection states:
// Presentation > Version > Page

// The global object representing all the abstract state of the screen.
class EditorData extends Observable {
    // Events {

    static EVENT_VERSION_COMMENT_QUERY_CHANGED = "VERSION_COMMENT_QUERY_CHANGED";

    static EVENT_COMMENT_EDITING_STARTED = "COMMENT_EDITING_STARTED";
    static EVENT_COMMENT_EDITING_FINISHED = "COMMENT_EDITING_FINISHED";

    // }

    constructor(presentationId) {
        super();

        this.listener = new Listener();

        this.presentationId = presentationId;
        this.selTracker = new EditorSelTracker();
        this.selTracker.addEventListener(EditorSelTracker.EVENT_ACTIVE_PAGE_CHANGED, () => this.onActivePageChanged(), this.listener);

        this.versionCommentQuery = null;
        this.editedVersionComment = null;

        this.versionList = new VersionList(this.presentationId);
        this.versionList.addEventListener(VersionList.EVENT_INITIAL_FETCH_CONCLUDED, () => {
            this.selTracker.activateVersion(this.versionList.versions.getLast());
        }, this.listener);
    }

    terminate() {
        super.terminate();
        this.listener.terminate();
        this.selTracker.terminate();
        this.versionList.terminate();
        this.versionCommentQuery?.terminate();
    }

    onActivePageChanged() {
        // TODO: Support querying for comments on _all_ the pages. This could be exposed in the UI as a filter option?

        if (this.editedVersionComment !== null) {
            this.finishEditingComment(false);
        }

        this.versionCommentQuery?.terminate();
        this.versionCommentQuery = new VersionCommentQuery(this.selTracker.version, this.selTracker.activePageNo);

        this.notifyAll(new Event(EditorData.EVENT_VERSION_COMMENT_QUERY_CHANGED, {}));
    }

    //
    // Comment editing (modal state tracking).
    // TODO: Extract this out into a separate class so we can keep our data.js lean and mean?
    //

    startEditingComment(versionComment) {
        this.editedVersionComment = versionComment;
        this.notifyAll(new Event(EditorData.EVENT_COMMENT_EDITING_STARTED, {}));
    }

    finishEditingComment(submit) {
        if (submit) {
            // TODO: Put this code somewhere more reasonable.
            (async () => {
                let versionComment = this.editedVersionComment,
                    comment = versionComment.comment,

                // Create an entry in the comments collection.
                // This data is supposed to be shared across all versions that contain this comment.
                    appwriteComment = await appwrite.database.createDocument(
                    "comments", 
                    "unique()", 
                    {text: comment.text, author: comment.author});

                // Create an entry in the comment-version collection.
                // This is supposed to contain version-specific data related to a given comment.
                await appwrite.database.createDocument(
                    VersionCommentQuery.VERSION_COMMENT_COLLECTION_ID,
                    "unique()", 
                    {
                        presentationVersion: this.selTracker.version.appwriteId,
                        pageNo: this.selTracker.activePageNo,
                        xOnPage: versionComment.pageX,
                        yOnPage: versionComment.pageY,
                        comment: appwriteComment.$id,
                    },
                );
            })();
        }

        this.editedVersionComment.terminate();
        this.editedVersionComment = null;

        this.notifyAll(new Event(EditorData.EVENT_COMMENT_EDITING_FINISHED, {submitted: submit}));
    }
}

export {EditorData, data, initData, terminateData};
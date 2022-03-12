import { Observable, Event, Listener } from "../../../common/model/Observable.js";
import { VersionList } from "../../../common/model/VersionList.js";
import { EditorSelTracker } from "./EditorSelTracker.js";
import { VersionCommentQuery } from "../../../common/model/VersionCommentQuery.js";
import { EditorCommentEditing } from "./EditorCommentEditing.js";
import { EditorViewingArea } from "./ViewingArea.js";

var data;

function initData(presentationId) {
    data = new EditorData(presentationId);
}

function terminateData() {
    data.terminate();
    data = null;
}

// The global object representing all the abstract state of the screen.
class EditorData extends Observable {
    static EVENT_VERSION_COMMENT_QUERY_CHANGED = "VERSION_COMMENT_QUERY_CHANGED";

    constructor(presentationId) {
        super();

        this.listener = new Listener();

        this.presentationId = presentationId;

        this.selTracker = new EditorSelTracker();
        this.selTracker.addEventListener(EditorSelTracker.EVENT_ACTIVE_PAGE_CHANGED, () => this.onActivePageChanged(), this.listener);

        this.versionCommentQuery = null;

        this.commentEditing = new EditorCommentEditing();

        this.versionList = new VersionList(this.presentationId);
        this.versionList.addEventListener(VersionList.EVENT_INITIAL_FETCH_CONCLUDED, () => {
            this.selTracker.activateVersion(this.versionList.versions.getLast());
        }, this.listener);

        this.viewingArea = new EditorViewingArea();
    }

    terminate() {
        super.terminate();
        this.commentEditing.terminate();
        this.listener.terminate();
        this.selTracker.terminate();
        this.versionList.terminate();
        this.versionCommentQuery?.terminate();
        this.viewingArea.terminate();
    }

    onActivePageChanged() {
        if (this.commentEditing.isEditing()) {
            this.commentEditing.finishEditingComment(false);
        }

        this.versionCommentQuery?.terminate();
        // TODO: Support querying for comments on _all_ the pages. This could be exposed in the UI as a filter option?
        this.versionCommentQuery = new VersionCommentQuery(this.selTracker.version, this.selTracker.activePageNo);

        this.notifyAll(new Event(EditorData.EVENT_VERSION_COMMENT_QUERY_CHANGED, {}));
    }
}

export {EditorData, data, initData, terminateData};
import { Listener } from "../../../../common/model/Observable.js";
import { ObservableArray } from "../../../../common/model/ObservableArray.js";
import { VersionComment } from "../../../../common/model/VersionComment.js";
import { cloneDomTemplate } from "../../../../common/ui/dom-utils.js";
import { EditorData, data } from "../../model/data.js";
import { EditorCommentEditing } from "../../model/EditorCommentEditing.js";
import { UiCommentMarker } from "./UiCommentMarker.js";

class UiMarkerLayer {
    constructor(screen, pageRectTracker) {
        this.listener = new Listener();

        this.pageRectTracker = pageRectTracker;

        this.commentMarkers = [];

        this.commentEditingMarker = null;
        this.markerContainerEl = screen.el.querySelector(".id-marker-container");

        data.commentEditing.addEventListener(EditorCommentEditing.EVENT_COMMENT_EDITING_STARTED, () => this.onCommentEditingStarted(), this.listener);
        data.commentEditing.addEventListener(EditorCommentEditing.EVENT_COMMENT_EDITING_FINISHED, () => this.onCommentEditingFinished(), this.listener);

        data.addEventListener(EditorData.EVENT_VERSION_COMMENT_QUERY_CHANGED, () => this.onVersionCommentQueryChanged(), this.listener);
    }

    terminate() {
        this.listener.terminate();
    }

    async onCommentEditingStarted() {
        this.commentEditingMarker = this.createCommentMarker(data.commentEditing.editedVersionComment);
    }

    onVersionCommentQueryChanged() {
        this.clearCommentMarkers();
        data.versionCommentQuery.versionComments.addEventListener(ObservableArray.EVENT_ITEM_ADDED, e => this.createCommentMarker(e.data.item), this.listener);
        data.versionCommentQuery.versionComments.addEventListener(ObservableArray.EVENT_CLEARED, () => this.clearCommentMarkers(), this.listener);
    }

    onCommentEditingFinished() {
        this.commentEditingMarker?.terminate();
        this.commentEditingMarker = null;
    }

    createCommentMarker(versionComment) {
        let commentMarker = new UiCommentMarker(this.pageRectTracker, versionComment);
        this.commentMarkers.push(commentMarker);
        this.markerContainerEl.appendChild(commentMarker.el);

        return commentMarker;
    }

    clearCommentMarkers() {
        this.commentMarkers.forEach(commentMarker => {
            commentMarker.terminate();
        });
        this.commentMarkers.length = 0;

        this.markerContainerEl.innerHTML = "";
    }
}

export { UiMarkerLayer };
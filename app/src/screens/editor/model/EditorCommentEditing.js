import { Observable, Event } from "../../../common/model/Observable.js";

// Comment editing must be coordinated across the entire user interface, since multiple
// widgets are involved.
class EditorCommentEditing extends Observable {
    static EVENT_COMMENT_EDITING_STARTED = "COMMENT_EDITING_STARTED";
    static EVENT_COMMENT_EDITING_FINISHED = "COMMENT_EDITING_FINISHED";

    constructor() {
        super();
        this.editedVersionComment = null;
    }

    isEditing() {
        return this.editedVersionComment !== null;
    }

    startEditingComment(versionComment) {
        this.editedVersionComment = versionComment;
        this.notifyAll(new Event(EditorCommentEditing.EVENT_COMMENT_EDITING_STARTED, {}));
    }

    finishEditingComment(submit) {
        if (submit) {
            this.editedVersionComment.submit();
        }

        if(this.editedVersionComment != null){
            this.editedVersionComment.terminate();
            this.editedVersionComment = null;
            this.notifyAll(new Event(EditorCommentEditing.EVENT_COMMENT_EDITING_FINISHED, {submitted: submit}));
        }
    }
}

export { EditorCommentEditing };
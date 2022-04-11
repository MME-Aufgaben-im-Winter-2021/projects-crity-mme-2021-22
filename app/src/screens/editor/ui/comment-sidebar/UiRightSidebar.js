import { UiCommentEditor } from "./UiCommentEditor.js";
import { UiCommentList } from "./UiCommentList.js";

class UiRightSidebar {
    constructor(screen, editorScreen) {
        this.el = screen.el.querySelector(".id-sidebar-right");

        this.commentList = new UiCommentList(screen, editorScreen);
        this.commentEditor = new UiCommentEditor(screen);
    }

    terminate() {
        this.commentList.terminate();
        this.commentEditor.terminate();
    }
}

export { UiRightSidebar };
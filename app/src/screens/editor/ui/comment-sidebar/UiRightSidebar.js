import { UiCommentEditor } from "./UiCommentEditor.js";
import { UiCommentList } from "./UiCommentList.js";

class UiRightSidebar {
    constructor(screen) {
        this.el = screen.el.querySelector(".id-sidebar-right");

        this.commentList = new UiCommentList(screen);
        this.commentEditor = new UiCommentEditor(screen);
    }

    terminate() {
        this.commentList.terminate();
        this.commentEditor.terminate();
    }
}

export { UiRightSidebar };
import { UiCommentInputFields } from "./UiCommentInputFields.js";
import { UiCommentList } from "./UiCommentList.js";

class UiRightSidebar {
    constructor(screen) {
        this.el = screen.el.querySelector(".id-sidebar-right");

        this.commentList = new UiCommentList(screen);
        this.commentInputFields = new UiCommentInputFields(screen);
    }

    terminate() {
        this.commentList.terminate();
    }
}

export { UiRightSidebar };
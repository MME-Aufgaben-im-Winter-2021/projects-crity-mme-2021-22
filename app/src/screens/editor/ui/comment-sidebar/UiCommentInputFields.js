import { data } from "../../model/data.js";
import { Comment } from "../../model/Comment.js";

class UiCommentInputFields {
    constructor(screen) {
        this.nameInputField = screen.el.querySelector(".id-name-input");

        this.commentInputField = screen.el.querySelector(".id-comment-input");
        this.commentInputField.addEventListener("keydown", e => this.onKeyDown(e));
    }

    onKeyDown(e) {
        if(e.keyCode !== 13) {
            return;
        }

        // TODO: (Why) do we need this?
        e.preventDefault();

        let text = this.commentInputField.value,
            name = this.nameInputField.value,
            comment = new Comment(name, text);

        this.commentInputField.value = "";

        data.activePdf.activePageComments.createComment(comment);
    }
}

export { UiCommentInputFields };
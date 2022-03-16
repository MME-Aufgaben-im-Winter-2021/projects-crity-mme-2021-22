import { cloneDomTemplate } from "../../../../common/ui/dom-utils.js";

class UiComment {
    constructor(comment, parent, versionComment) {
        this.parent = parent;
        this.versionComment = versionComment;

        this.el = cloneDomTemplate("#thread-template");

        this.textEl = this.el.querySelector(".thread-title");
        this.textEl.textContent = comment.text;

        this.authorEl = this.el.querySelector(".thread-author");
        this.authorEl.textContent = comment.author;

        this.header = this.el.querySelector(".thread-header");
        //this.header.addEventListener("click", () => this.clicked());

        this.comments = this.el.querySelector(".thread-comments");
        this.comments.style.display = "none";

        this.like = this.el.querySelector(".thread-like");
        this.like.addEventListener("click", () => this.likeClicked());
        this.likeFilled = this.el.querySelector(".thread-like-filled");
        this.likeFilled.addEventListener("click", () => this.likeClicked());

        this.arrowUp = this.el.querySelector(".thread-arrow-up");
        this.arrowUp.addEventListener("click", () => this.clicked());
        this.arrowDown = this.el.querySelector(".thread-arrow-down");
        this.arrowDown.addEventListener("click", () => this.clicked());

        this.liked = false;
        this.checkForLike(comment);
        this.addComments(comment);
    }

    checkForLike(comment) {
        comment.likes.forEach(id => {
            if(id == this.versionComment.id) {
                this.toggleLike();
                this.liked = true;
            }
        });
    }

    addComments(comment) {
        this.comments.innerHTML = "";
        for(let i = 0; i < comment.authors.length; i++) {
            let commentElement = cloneDomTemplate("#thread-comment-template");

            let commentElementText = commentElement.querySelector(".comment-text");
            commentElementText.textContent = comment.messages[i];

            let commentElementAuthor = commentElement.querySelector(".comment-author");
            commentElementAuthor.textContent = comment.authors[i];

            this.comments.appendChild(commentElement);
        }
    }

    clicked() {
        this.parent.shutDownLastOpen(this);
        this.toggle();
    }

    likeClicked() {
        this.toggleLike();
        if(this.liked) {
            this.versionComment.changeLikeStatus(false);
        }else{
            this.versionComment.changeLikeStatus(true);
        }
        
    }

    toggle() {
        if (this.comments.style.display === "none") {
            this.comments.style.display = "block";
            this.arrowUp.classList.add("hidden");
            this.arrowDown.classList.remove("hidden");
            this.versionComment.subscribeToCommentDocument(this);
            this.versionComment.loadNewestComments(this);
        } else {
            this.comments.style.display = "none";
            this.arrowUp.classList.remove("hidden");
            this.arrowDown.classList.add("hidden");
            this.versionComment.unsubscribeFunc();
        }
    }

    toggleLike() {
        this.likeFilled.classList.toggle("hidden");
        this.like.classList.toggle("hidden");
    }

    terminate() {
        return;
    }

    addComment(author, text, fromAppwrite) {
        let commentElement = cloneDomTemplate("#thread-comment-template");

        let commentElementText = commentElement.querySelector(".comment-text");
        commentElementText.textContent = text;

        let commentElementAuthor = commentElement.querySelector(".comment-author");
        commentElementAuthor.textContent = author;

        this.comments.appendChild(commentElement);
    }
}

export { UiComment };
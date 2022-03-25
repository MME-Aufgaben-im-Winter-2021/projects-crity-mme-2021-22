import { cloneDomTemplate } from "../../../../common/ui/dom-utils.js";
import { accountSession } from "../../../../common/model/AccountSession.js";

class UiComment {
    constructor(comment, parent, versionComment) {
        this.parent = parent;
        this.versionComment = versionComment;
        this.comment = comment;

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

        this.likeCounter = this.el.querySelector(".like-counter");
        this.likeCounter.textContent = comment.likes.length;

        this.liked = false;
        this.checkForLike(comment);
        this.addComments(comment);
    }

    checkForLike(comment) {
        comment.likes.forEach(id => {
            if(id === accountSession.accountId) {
                this.toggleLike();
                this.liked = true;
            }
        });
    }

    addComments(comment) {
        this.comments.innerHTML = "";
        this.comment = comment;
        for(let i = 0; i < comment.authors.length; i++) {
            let commentElement = cloneDomTemplate("#thread-comment-template"),
                commentElementText = commentElement.querySelector(".comment-text"),
                commentElementAuthor = commentElement.querySelector(".comment-author");
                commentElementText.textContent = comment.messages[i];
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
            this.versionComment.changeLikeStatus(false, this);
            this.liked = false;
        }else{
            this.versionComment.changeLikeStatus(true, this);
            this.liked = true;
        }
        
    }

    likesChanged(newLikes) {
        this.likeCounter.textContent = newLikes.length;
        this.comment.likes = newLikes;
    }

    toggle() {
        if (this.comments.style.display === "none") {
            this.comments.style.display = "block";
            this.arrowUp.classList.add("hidden");
            this.arrowDown.classList.remove("hidden");
            this.versionComment.subscribeToCommentDocument(this);
            this.versionComment.loadNewestComments(this);
            this.versionComment.commentOpened();
        } else {
            this.comments.style.display = "none";
            this.arrowUp.classList.remove("hidden");
            this.arrowDown.classList.add("hidden");
            this.versionComment.unsubscribeFunc();
            this.versionComment.commentClosed();
        }
    }

    toggleLike() {
        this.likeFilled.classList.toggle("hidden");
        this.like.classList.toggle("hidden");
    }

    terminate() {
        return;
    }

    addComment(author, text) {
        let commentElement = cloneDomTemplate("#thread-comment-template"),
            commentElementText = commentElement.querySelector(".comment-text"),
            commentElementAuthor = commentElement.querySelector(".comment-author");
        commentElementText.textContent = text;

        commentElementAuthor.textContent = author;

        this.comments.appendChild(commentElement);
    }
}

export { UiComment };
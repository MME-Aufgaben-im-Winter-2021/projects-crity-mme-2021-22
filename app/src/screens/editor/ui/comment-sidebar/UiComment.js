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

        this.comments = this.el.querySelector(".thread-comments");
        this.comments.style.display = "none";

        this.vote = this.el.querySelector(".thread-like");
        this.vote.addEventListener("click", () => this.voteClicked());
        this.voteFilled = this.el.querySelector(".thread-like-filled");
        this.voteFilled.addEventListener("click", () => this.voteClicked());

        this.arrowUp = this.el.querySelector(".thread-arrow-up");
        this.arrowUp.addEventListener("click", () => this.clicked());
        this.arrowDown = this.el.querySelector(".thread-arrow-down");
        this.arrowDown.addEventListener("click", () => this.clicked());

        this.voteCounter = this.el.querySelector(".like-counter");
        this.voteCounter.textContent = comment.votes.length;

        versionComment.registerUiComment(this);
        this.voted = false;
        this.checkForVotes(comment);
        this.addComments(comment);
    }

    checkForVotes(comment) {
        comment.votes.forEach(id => {
            if(id === accountSession.accountId) {
                this.toggleVote();
                this.voted = true;
            }
        });
    }

    addComments(comment) {
        this.comments.innerHTML = "";
        this.comment = comment;
        for(let i = 0; i < comment.subComments.length; i++) {
            let commentElement = cloneDomTemplate("#thread-comment-template"),
                commentElementText = commentElement.querySelector(".comment-text"),
                commentElementAuthor = commentElement.querySelector(".comment-author");
                commentElementText.textContent = comment.subComments[i].message;
                commentElementAuthor.textContent = comment.subComments[i].author;
            this.comments.appendChild(commentElement);
        }
    }

    clicked() {
        this.parent.shutDownLastOpen(this);
        this.toggle();
    }

    voteClicked() {
        this.toggleVote();
        if(this.voted) {
            this.versionComment.changeVoteStatus(false, this);
            this.voted = false;
        }else{
            this.versionComment.changeVoteStatus(true, this);
            this.voted = true;
        }
        
    }

    votesChanged(newVotes) {
        this.voteCounter.textContent = newVotes.length;
        this.comment.votes = newVotes;
    }

    toggle() {
        if (this.comments.style.display === "none") {
            this.comments.style.display = "block";
            this.arrowUp.classList.add("hidden");
            this.arrowDown.classList.remove("hidden");
            this.versionComment.commentOpened();
        } else {
            this.comments.style.display = "none";
            this.arrowUp.classList.remove("hidden");
            this.arrowDown.classList.add("hidden");
            this.versionComment.commentClosed();
        }
    }

    toggleVote() {
        this.voteFilled.classList.toggle("hidden");
        this.vote.classList.toggle("hidden");
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
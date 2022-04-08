import { cloneDomTemplate } from "../../../../common/ui/dom-utils.js";
import { accountSession, LoginState } from "../../../../common/model/AccountSession.js";

class UiComment {
    constructor(comment, parent, versionComment, editorScreen) {
        this.parent = parent;
        this.versionComment = versionComment;
        this.comment = comment;

        console.log("Received version " + versionComment.version);
        this.el = cloneDomTemplate("#thread-template");
        this.mainPanel =this.el.querySelector(".thread-main-panel");

        this.textEl = this.el.querySelector(".thread-title");
        this.textEl.textContent = comment.text;

        this.authorEl = this.el.querySelector(".thread-author");
        this.authorEl.textContent = comment.author;

        this.comments = this.el.querySelector(".thread-comments");
        this.comments.style.display = "none";

        this.checkbox = this.el.querySelector(".checkbox");
        this.checkboxDiv = this.el.querySelector(".checkbox-div");
        this.checkbox.addEventListener("change", () => this.checkboxChanged());

        if(!editorScreen.authorMode){
            this.checkboxDiv.classList.toggle("hidden");
        }else{
            for(let i = 0; i < versionComment.version.commentsChecked.length; i++){
                if(versionComment.version.commentsChecked[i] === versionComment.id){
                    this.checkbox.checked = true;
                }
            }
        }

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

    checkboxChanged() {
        this.versionComment.version.setCheckedArray(this.versionComment.id);
    }

    checkForVotes(comment) {
        if (accountSession.loginState === LoginState.LOGGED_IN) {
            comment.votes.forEach(id => {
                if(id === accountSession.accountId) {
                    this.toggleVote();
                    this.voted = true;
                }
            });
        }
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
            this.el.style.backgroundColor = "#94a3b8";
            this.arrowUp.classList.add("hidden");
            this.arrowDown.classList.remove("hidden");
            this.versionComment.setSelected();
        } else {
            this.comments.style.display = "none";
            this.arrowUp.classList.remove("hidden");
            this.el.style.backgroundColor = "#cbd5e1";
            this.arrowDown.classList.add("hidden");
            this.versionComment.unsetSelected();
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
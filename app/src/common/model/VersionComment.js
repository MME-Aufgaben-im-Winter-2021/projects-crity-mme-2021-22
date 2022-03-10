import { appwrite } from "./appwrite.js";
import { Comment } from "./Comment.js";
import { Observable, Event } from "./Observable.js";

class VersionComment extends Observable {
    static EVENT_PAGE_POS_CHANGED = "PAGE_POS_CHANGED";

    constructor(comment, pageX, pageY) {
        super();

        this.comment = comment;
        this.pageX = pageX;
        this.pageY = pageY;
    }

    static async fromAppwriteDocument(appwriteVersionComment) {
        let appwriteComment = await appwrite.database.getDocument("comments", appwriteVersionComment.comment),
            comment = Comment.fromAppwriteDocument(appwriteComment);
        return new VersionComment(comment, appwriteVersionComment.xOnPage, appwriteVersionComment.yOnPage);
    }

    setPagePos(pageX, pageY) {
        this.pageX = pageX;
        this.pageY = pageY;

        this.notifyAll(new Event(VersionComment.EVENT_PAGE_POS_CHANGED, {}));
    }
}

export { VersionComment };
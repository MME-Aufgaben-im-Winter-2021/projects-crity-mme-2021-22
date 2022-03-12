import { Listener } from "../../../../common/model/Observable.js";
import { UiScrollbar } from "../../../../common/ui/UiScrollbar.js";
import { data } from "../../model/data.js";
import { EditorViewingArea } from "../../model/ViewingArea.js";
import { UiPageRectTracker } from "./UiPageRectTracker.js";

class UiViewportScrollbar extends UiScrollbar {
    constructor(screen, pageRectTracker, axis) {
        super(screen.el.querySelector(`.id-scrollbar-${axis}-container`), axis);

        this.listener = new Listener();
        
        this.pageRectTracker = pageRectTracker;
        this.pageRectTracker.addEventListener(UiPageRectTracker.EVENT_PAGE_RECT_CHANGED, () => this.reconfigure(), this.listener);

        this.addEventListener(UiScrollbar.EVENT_VISIBLE_INTERVAL_CHANGED, () => this.onVisibleIntervalChanged(), this.listener);
    }

    reconfigure() {
        let pageRect = this.pageRectTracker.computePageRect();

        let pageStart, pageEnd;
        if (this.axis === "x") {
            pageStart = pageRect.left;
            pageEnd = pageRect.right;
        } else {
            pageStart = pageRect.top;
            pageEnd = pageRect.bottom;
        }

        super.reconfigure(0, this.getViewportSize(), pageStart, pageEnd);
    }

    onVisibleIntervalChanged() {
        let pageRect = this.pageRectTracker.computePageRect();

        if (this.axis === "x") {
            pageRect.left = this.visibleStart;
            pageRect.right = this.visibleEnd;
        } else {
            pageRect.top = this.visibleStart;
            pageRect.bottom = this.visibleEnd;
        }

        this.pageRectTracker.setPageRect(pageRect);
    }

    getViewportSize() {
        if (this.axis === "x") {
            return this.pageRectTracker.getViewportWidth();
        } else {
            return this.pageRectTracker.getViewportHeight();
        }
    }

    terminate() {
        this.listener.terminate();
        super.terminate();
    }
}

export { UiViewportScrollbar };
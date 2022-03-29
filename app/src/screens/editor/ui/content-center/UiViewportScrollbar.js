import { Listener } from "../../../../common/model/Observable.js";
import { UiScrollbar } from "../../../../common/ui/UiScrollbar.js";
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
        let pageRect, pageStart, pageEnd, pageSize;

        pageRect = this.pageRectTracker.computePageRect();

        if (this.axis === "x") {
            pageStart = pageRect.left;
            pageEnd = pageRect.right;
        } else {
            pageStart = pageRect.top;
            pageEnd = pageRect.bottom;
        }

        pageSize = pageEnd - pageStart;

        super.reconfigure(0, pageSize, -pageStart, this.getViewportSize() - pageStart);
    }

    onVisibleIntervalChanged() {
        let pageRect = this.pageRectTracker.computePageRect();

        if (this.axis === "x") {
            let pageSize = pageRect.right - pageRect.left;
            pageRect.left = -this.visibleStart;
            pageRect.right = pageRect.left + pageSize;
        } else {
            let pageSize = pageRect.bottom - pageRect.top;
            pageRect.top = -this.visibleStart;
            pageRect.bottom = pageRect.top + pageSize;
        }

        this.pageRectTracker.setPageRect(pageRect);
    }

    getViewportSize() {
        let result;
        if (this.axis === "x") {
            result = this.pageRectTracker.getViewportWidth();
        } else {
            result = this.pageRectTracker.getViewportHeight();
        }
        return result;
    }

    terminate() {
        this.listener.terminate();
        super.terminate();
    }
}

export { UiViewportScrollbar };
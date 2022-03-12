import { Observable, Event, Listener } from "../../../../common/model/Observable.js";
import { data } from "../../model/data.js";
import { EditorSelTracker } from "../../model/EditorSelTracker.js";
import { EditorViewingArea } from "../../model/ViewingArea.js";

class UiPageRectTracker extends Observable {
    static EVENT_PAGE_RECT_CHANGED = "PAGE_RECT_CHANGED";

    constructor(screen) {
        super();

        this.listener = new Listener();
        this.viewportEl = screen.el.querySelector(".id-viewport");
        this.resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                if (entry.contentBoxSize && data.selTracker.activePage) {
                    this.emitChangeEvent();
                }
            }
        });
        this.resizeObserver.observe(this.viewportEl);

        // Changing the active page might change the aspect ratio, which in turn changes the page rect.
        data.selTracker.addEventListener(EditorSelTracker.EVENT_ACTIVE_PAGE_CHANGED, () => this.emitChangeEvent(), this.listener);

        data.viewingArea.addEventListener(EditorViewingArea.EVENT_CHANGED, () => this.emitChangeEvent(), this.listener);
    }

    terminate() {
        super.terminate();
        this.listener.terminate();
        this.resizeObserver.unobserve(this.viewportEl);
    }

    emitChangeEvent() {
        this.notifyAll(new Event(UiPageRectTracker.EVENT_PAGE_RECT_CHANGED, {}));
    }

    getViewportWidth() {
        return this.viewportEl.offsetWidth;
    }

    getViewportHeight() {
        return this.viewportEl.offsetHeight;
    }

    clientToViewportCoords(clientX, clientY) {
        let boundingRect, viewportX, viewportY;

        boundingRect = this.viewportEl.getBoundingClientRect();
        
        viewportX = clientX - boundingRect.left;
        viewportY = clientY - boundingRect.top;

        return [viewportX, viewportY];
    }

    computePageRect() {
        let asp, pageRect;

        asp = 1;
        if (data.selTracker.activePage !== null) {
            asp = data.selTracker.activePage.asp;
        }
        pageRect = data.viewingArea.computePageRect(asp, this.viewportEl.offsetWidth, this.viewportEl.offsetHeight);
        return pageRect;
    }

    setPageRect(pageRect) {
        if (data.selTracker.activePage === null) {
            return;
        }
        data.viewingArea.setPageRect(data.selTracker.activePage.asp, this.viewportEl.offsetWidth, this.viewportEl.offsetHeight, pageRect);
    }
}

export { UiPageRectTracker };
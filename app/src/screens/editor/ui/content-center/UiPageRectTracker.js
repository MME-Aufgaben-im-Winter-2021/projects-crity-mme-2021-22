import { Observable, Event, Listener } from "../../../../common/model/Observable.js";
import { data } from "../../model/data.js";
import { EditorSelTracker } from "../../model/EditorSelTracker.js";
import { EditorViewingArea } from "../../model/ViewingArea.js";

// Tracks all the possible changes to the page rect, see EditorViewingArea for more details.
class UiPageRectTracker extends Observable {
    static EVENT_PAGE_RECT_CHANGED = "PAGE_RECT_CHANGED";

    constructor(screen) {
        super();

        this.listener = new Listener();
        this.containerEl = screen.el.querySelector(".id-content-center-container");
        this.resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                if (entry.contentBoxSize && data.selTracker.activePage) {
                    this.emitChangeEvent();
                }
            }
        });
        this.resizeObserver.observe(this.containerEl);

        // Changing the active page might change the aspect ratio, which in turn changes the page rect.
        data.selTracker.addEventListener(EditorSelTracker.EVENT_ACTIVE_PAGE_CHANGED, () => this.emitChangeEvent(), this.listener);

        data.viewingArea.addEventListener(EditorViewingArea.EVENT_CHANGED, () => this.emitChangeEvent(), this.listener);
    }

    terminate() {
        super.terminate();
        this.listener.terminate();
        this.resizeObserver.unobserve(this.containerEl);
    }

    emitChangeEvent() {
        this.notifyAll(new Event(UiPageRectTracker.EVENT_PAGE_RECT_CHANGED, {}));
    }

    getContainerWidth() {
        return this.containerEl.offsetWidth;
    }

    getContainerHeight() {
        return this.containerEl.offsetHeight;
    }

    clientToContainerCoords(clientX, clientY) {
        let boundingRect, containerX, containerY;

        boundingRect = this.containerEl.getBoundingClientRect();
        
        containerX = clientX - boundingRect.left;
        containerY = clientY - boundingRect.top;

        return [containerX, containerY];
    }

    computePageRect() {
        let asp, pageRect;

        asp = 1;
        if (data.selTracker.activePage !== null) {
            asp = data.selTracker.activePage.asp;
        }
        pageRect = data.viewingArea.computePageRect(asp, Math.max(1, this.containerEl.offsetWidth), Math.max(1, this.containerEl.offsetHeight));
        return pageRect;
    }

    setPageRect(pageRect) {
        if (data.selTracker.activePage === null) {
            return;
        }
        data.viewingArea.setPageRect(data.selTracker.activePage.asp, Math.max(1, this.containerEl.offsetWidth), Math.max(1, this.containerEl.offsetHeight), pageRect);
    }
}

export { UiPageRectTracker };
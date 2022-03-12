import { Observable, Event } from "../model/Observable.js";
import { assert } from "../utils.js";
import { cloneDomTemplate } from "./dom-utils.js";

// Custom scrollbar. Works by creating a dummy div that is big enough to produce the desired knob length.
class UiScrollbar extends Observable {
    static EVENT_VISIBLE_INTERVAL_CHANGED = "VISIBLE_INTERVAL_CHANGED";

    constructor(containerDiv, axis) {
        super();

        assert(axis === "x" || axis === "y");

        this.axis = axis;
        this.el = cloneDomTemplate(`#scrollbar-${axis}-template`);
        this.fakeContentEl = this.el.querySelector(".id-fake-content");
        
        containerDiv.appendChild(this.el);

        this.el.addEventListener("scroll", () => this.onScroll());

        this.throttledScrollHandlerPending = false;
    }

    reconfigure(contentStart, contentEnd, visibleStart, visibleEnd) {
        this.contentStart = contentStart;
        this.contentEnd = contentEnd;
        this.visibleStart = visibleStart;
        this.visibleEnd = visibleEnd;

        let contentSize = contentEnd - contentStart;
        let visibleSize = visibleEnd - visibleStart;
        let visibleProportion = visibleSize / contentSize;

        this.setFakeContentSize(`${100*visibleProportion}%`);

        let elSize = this.getElSize();
        this.scrollTo(elSize * (contentStart - visibleStart) / contentSize);
    }

    onScroll() {
        // MSDN suggests doing this: https://developer.mozilla.org/en-US/docs/Web/API/Element/scroll_event#scroll_event_throttling
        // An alternative might be to have the viewing area only emit events on animation frames?
        if (!this.throttledScrollHandlerPending) {
            this.throttledScrollHandlerPending = true;

            window.requestAnimationFrame(() => {
                this.onThrottledScroll();
                this.throttledScrollHandlerPending = false;
            });
        }
    }

    onThrottledScroll() {
        console.log("Executing throttled scroll.");
        let scrollPos;
        if (this.axis === "x") {
            scrollPos = this.el.scrollLeft;
        } else {
            scrollPos = this.el.scrollTop;
        }

        let elSize = this.getElSize();

        let visibleSize = this.visibleEnd - this.visibleStart;
        let contentSize = this.contentEnd - this.contentStart;
        this.visibleStart = -scrollPos * contentSize / elSize - this.contentStart;
        this.visibleEnd = this.visibleStart + visibleSize;

        this.notifyAll(new Event(UiScrollbar.EVENT_VISIBLE_INTERVAL_CHANGED, {}));
    }

    scrollTo(numPixels) {
        let scrollOptions = {};
        scrollOptions.behavior = "instant";

        if (this.axis === "x") {
            scrollOptions.left = numPixels;
        } else {
            scrollOptions.top = numPixels;
        }

        this.el.scrollTo(scrollOptions);
    }

    getElSize() {
        if (this.axis === "x") {
            return this.el.offsetWidth;
        } else {
            return this.el.offsetHeight;
        }
    }

    setFakeContentSize(size) {
        if (this.axis === "x") {
            this.fakeContentEl.style.width = size;
        } else {
            this.fakeContentEl.style.height = size;
        }
    }
}

export { UiScrollbar };
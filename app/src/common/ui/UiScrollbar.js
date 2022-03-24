import { Observable, Event } from "../model/Observable.js";
import { assert, lerp } from "../utils.js";
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

        this.scrollPos = 0;
        
        containerDiv.appendChild(this.el);

        this.el.addEventListener("scroll", () => this.onScroll());
        this.el.addEventListener("mousedown", () => this.onMouseDown());

        this.throttledScrollHandlerPending = false;
    }

    // Kind of confusing: The knob represents the visible area, the trough represents the content (which is
    // bigger than the visible area when zoomed in). 

    reconfigure(contentStart, contentEnd, visibleStart, visibleEnd) {
        this.contentStart = contentStart;
        this.contentEnd = contentEnd;
        this.visibleStart = visibleStart;
        this.visibleEnd = visibleEnd;
        this.p_reconfigure();
    }

    p_reconfigure() {
        let ds, absoluteFakeContentSize;

        ds = this.computeDerivedSizes();

        this.setFakeContentSize(`${100.0/ds.visibleClippedProportion}%`);

        absoluteFakeContentSize = this.getFakeContentSize();
        this.scrollPos = absoluteFakeContentSize * Math.max(0.0, this.visibleStart - this.contentStart) / ds.contentSize;
        this.scrollTo(this.scrollPos);
    }

    computeDerivedSizes() {
        let visibleSize = this.visibleEnd - this.visibleStart, 
            clippedVisibleSize = Math.min(this.contentEnd, this.visibleEnd) - Math.max(this.contentStart, this.visibleStart),
            contentSize = this.contentEnd - this.contentStart,
            visibleClippedProportion = clippedVisibleSize / contentSize;

        return { visibleSize, clippedVisibleSize, contentSize, visibleClippedProportion };
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
        let scrollPos, relKnobLeft, ds = this.computeDerivedSizes();

        if (this.axis === "x") {
            scrollPos = this.el.scrollLeft;
        } else {
            scrollPos = this.el.scrollTop;
        }

        // HACK: Fix some numerical precision problems ... Ideally there would be a way to
        // tell the Web API not to call us when the scroll position was set programmatically ...
        if (Math.abs(scrollPos - this.scrollPos) < 2) {
            return;
        }

        this.scrollPos = scrollPos;

        relKnobLeft = scrollPos / this.getFakeContentSize();
        // "Un-clip" the knob.
        relKnobLeft -= Math.max(0, this.contentStart - this.visibleStart) / (this.contentEnd - this.contentStart);

        this.visibleStart = lerp(this.contentStart, this.contentEnd, relKnobLeft);
        this.visibleEnd = this.visibleStart + ds.visibleSize;

        this.notifyAll(new Event(UiScrollbar.EVENT_VISIBLE_INTERVAL_CHANGED, {}));
        this.p_reconfigure();
    }

    onMouseDown() {
        // There is no way (I can think of) to get the knob to e.g. be dragged farther out than the content
        // (unless we go crazy and write our own scrollbar with HTML5 canvas), so clip the position when the user clicks the scrollbar ...
        let ds = this.computeDerivedSizes();

        this.visibleStart = Math.max(this.visibleStart, this.contentStart);
        this.visibleEnd = this.visibleStart + ds.visibleSize;

        this.visibleEnd = Math.min(this.visibleEnd, this.contentEnd);
        this.visibleStart = this.visibleEnd - ds.visibleSize;

        this.notifyAll(new Event(UiScrollbar.EVENT_VISIBLE_INTERVAL_CHANGED, {}));
        this.p_reconfigure();
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
        let result;
        if (this.axis === "x") {
            result = this.el.offsetWidth;
        } else {
            result = this.el.offsetHeight;
        }
        return result;
    }

    setFakeContentSize(size) {
        if (this.axis === "x") {
            this.fakeContentEl.style.width = size;
        } else {
            this.fakeContentEl.style.height = size;
        }
    }

    getFakeContentSize() {
        let result;
        if (this.axis === "x") {
            result = this.fakeContentEl.offsetWidth;
        } else {
            result = this.fakeContentEl.offsetHeight;
        }
        return result;
    }
}

export { UiScrollbar };
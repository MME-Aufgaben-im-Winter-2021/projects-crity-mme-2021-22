import { Observable, Event } from "../model/Observable.js";
import { assert, lerp } from "../utils.js";
import { cloneDomTemplate } from "./dom-utils.js";

// Custom scrollbar. 
// For our PDF viewer, taking full control over the scrollbar seemed much easier than trying to put the
// canvas into a scrollable div, and then getting zoom and the text layer to work ...
// 
// So we try to do everything ourselves. This scrollbar was written for 1D content, for 2D content
// instantiate it twice! The idea is that we have two intervals:
// - The content interval. This is the "world". For e.g., PDFs set this to the edge coordinates of the page
//   in viewport coordinates.
// - The view interval. This is the interval of the content that is in view, i.e. if you're zoomed in this interval
//   is smaller than the content interval.
// We also try to support cases where the neither the content interval is contained in the view interval, nor the view interval
// is contained in the content interval; e.g. for PDFs this means the gray area is showing on only one side. In that case,
// we shrink the scrollbar knob, but since the WEB API's do not support this behavior we have to adjust the view interval when
// the user starts dragging the knob.
//
// Works by creating a dummy div("fakeContent") that is big enough to produce the desired knob length.
class UiScrollbar extends Observable {
    static EVENT_VISIBLE_INTERVAL_CHANGED = "VISIBLE_INTERVAL_CHANGED";

    // containerDiv: Where the scrollbar will be put. See UiEditorScreen.html for an example (not that
    // for some reason the classes for x and y had to be different, don't ask me why; I have no idea),
    // but you might have to play with CSS quite a bit to get it to work so good luck with that.
    // If the axis is "x" the knob moves from left to right. For axis==="y", ...
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
        this.scrollWasChangedProgrammatically = false;
    }

    // Kind of confusing: The knob represents the visible area, the trough represents the content (which is
    // bigger than the visible area when zoomed in). 

    reconfigure(contentStart, contentEnd, visibleStart, visibleEnd) {
        this.contentStart = contentStart;
        this.contentEnd = contentEnd;
        this.visibleStart = visibleStart;
        this.visibleEnd = visibleEnd;
        this.pReconfigure();
    }

    pReconfigure() {
        let ds, absoluteFakeContentSize;

        ds = this.computeDerivedSizes();

        this.setFakeContentSize(`${100.0/ds.visibleClippedProportion}%`);

        absoluteFakeContentSize = this.getFakeContentSize();
        this.scrollPos = absoluteFakeContentSize * Math.max(0.0, this.visibleStart - this.contentStart) / ds.contentSize;
        this.scrollTo(this.scrollPos);
    }

    // Compute some useful values that we don't store explicitly.
    computeDerivedSizes() {
        let visibleSize = this.visibleEnd - this.visibleStart, 
            clippedVisibleSize = Math.min(this.contentEnd, this.visibleEnd) - Math.max(this.contentStart, this.visibleStart),
            contentSize = this.contentEnd - this.contentStart,
            visibleClippedProportion = clippedVisibleSize / contentSize;

        return { visibleSize, clippedVisibleSize, contentSize, visibleClippedProportion };
    }

    onScroll() {
        // MDN suggests doing this: https://developer.mozilla.org/en-US/docs/Web/API/Element/scroll_event#scroll_event_throttling
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
        if (this.scrollWasChangedProgrammatically) {
            this.scrollWasChangedProgrammatically = false;
            return;
        }

        this.scrollPos = scrollPos;

        relKnobLeft = scrollPos / this.getFakeContentSize();
        // "Un-clip" the knob.
        relKnobLeft -= Math.max(0, this.contentStart - this.visibleStart) / (this.contentEnd - this.contentStart);

        this.visibleStart = lerp(this.contentStart, this.contentEnd, relKnobLeft);
        this.visibleEnd = this.visibleStart + ds.visibleSize;

        this.notifyAll(new Event(UiScrollbar.EVENT_VISIBLE_INTERVAL_CHANGED, {}));
        this.pReconfigure();
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
        this.pReconfigure();
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
        this.scrollWasChangedProgrammatically = true;
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
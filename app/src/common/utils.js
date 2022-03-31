// This turns of asserts.
// TODO: Do we also want to use this to enable/disable logging?
const IS_DBG = true;

// Pacify the linter.
// Often, we have variables that do not get used for a good reason,
// e.g. callback parameters. In that case, `unused(thingThatDoesntGetUsed)`
// can come in handy to move on with stuff that actually matters.
function unused() {
    return;
}

// TODO: Can webpack compile this out in release builds?
function assert(predicate) {
    if (!predicate) {
        // Set breakpoint here.
        // TODO: Does JS support programmatic breakpoints?
        console.assert(!IS_DBG);
    }
}

// Generate a globally unique ID.
let nextId = 0;
function generateId() {
    return nextId++;
}

// Linear interpolation.
function lerp(a, b, t) {
    return (1.0 - t) * a + t * b;
}

function clamped(x, min, max) {
    return Math.min(max, Math.max(min, x));
}

// Rectangles: Currently a plain JS-object with left, right, top, bottom properties;
// might want to create a class instead ...

function translateRect(rect, xOffset, yOffset) {
    rect.left += xOffset;
    rect.right += xOffset;
    rect.top += yOffset;
    rect.bottom += yOffset;
}

function scaleRect(rect, factor, xPivot, yPivot) {
    rect.left = lerp(xPivot, rect.left, factor);
    rect.right = lerp(xPivot, rect.right, factor);
    rect.top = lerp(yPivot, rect.top, factor);
    rect.bottom = lerp(yPivot, rect.bottom, factor);
}

export { unused, assert, generateId, lerp, clamped, translateRect, scaleRect };
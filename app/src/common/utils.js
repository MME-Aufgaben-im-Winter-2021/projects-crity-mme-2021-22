const IS_DBG = true;

// Pacify the linter.
// Often, we have variables that do not get used for a good reason,
// e.g. callback parameters. In that case, `unused(thingThatDoesntGetUsed)`
// can come in handy to move on with stuff that actually matters.
function unused() {
    return;
}

// TODO: Can webpack compile this out in release builds?
// TODO: Does JS support programmatic breakpoints?
function assert(predicate) {
    console.assert(!IS_DBG || predicate);
}

// Generate a globally unique ID.
let nextId = 0;
function generateId() {
    return nextId++;
}

export { unused, assert, generateId };
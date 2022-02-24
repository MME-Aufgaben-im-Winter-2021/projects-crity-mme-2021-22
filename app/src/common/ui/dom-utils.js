// IIRC, calling clone on the template directly produces a document fragment;
// this causes subtle issues when working with the fragment that are not
// very fun to debug. This method has proven more reliable thus far.
function cloneDomTemplate(id) {
    let templateEl = document.querySelector(id);
    return templateEl.content.firstElementChild.cloneNode(true);
}

/// After the function executes, the @p elements will have the CSS-class @p className if and 
/// only if @p predicate is ´true´.
function ensureCssClassPresentIff(predicate, className, ...elements) {
    elements.forEach(element => {
        if (predicate) {
            element.classList.add(className);
        } else {
            element.classList.remove(className);
        }
    });
}

export {cloneDomTemplate, ensureCssClassPresentIff};
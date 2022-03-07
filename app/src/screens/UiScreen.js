import { cloneDomTemplate } from "../common/ui/dom-utils.js";

class UiScreen {
    // Overwrite this when you inherit. This tells UiRegistry.add() under which URL to place the screen.
    static NAME = undefined;

    constructor(templateSelector, screenParameters) {
        this.el = cloneDomTemplate(templateSelector);
        this.screenParameters = screenParameters;
    }

    // Override this if you need to do initialization that might call #uiScreenScreenSwapper.loadScreen().
    // Should probably try to come up with a better design ...
    onScreenLoaded() {
        return;
    }

    // No longer needed, but probably a good practice to have sub-classes super-call this.
    terminate() {
        return;
    }

    static formatUrl(screen, screenParameters) {
        let urlSearchParams = new URLSearchParams(screenParameters),
            paramsString = urlSearchParams.toString();

        if (paramsString.length > 0) {
            paramsString = "?" + paramsString;
        }

        // Having the slash in there is important, otherwise history.pushState() won't remove
        // the old parameters.
        return `/${paramsString}#${screen}`;
    }
}

export { UiScreen };
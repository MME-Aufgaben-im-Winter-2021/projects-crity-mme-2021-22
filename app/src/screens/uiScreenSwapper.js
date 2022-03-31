import { UiScreen } from "./UiScreen.js";
import { uiScreenRegistry } from "./uiScreenRegistry.js";

var uiScreenSwapper;

class UiScreenSwapper {
    constructor() {
        this.el = document.querySelector("#screen-swapper");
        this.screen = null;

        window.onpopstate = e => this.onPopState(e);
    }

    // Called when the user navigates back in the browser.
    onPopState(e) {
        // Do not push, otherwise the forward-button won't work.
        this.loadScreenFromUrl(false);

        e.preventDefault();
    }

    loadScreenFromUrl(pushIntoBrowserHistory=true) {
        // TODO: This is probably not the best place for URL parsing ...
        let screen = (window.location.hash ? location.hash.substring(1) : "login"),
            urlSearchParams = new URLSearchParams(window.location.search),
            screenParameters = this.urlSearchParamsToObject(urlSearchParams);

        this.loadScreen(screen, screenParameters, pushIntoBrowserHistory);
    }

    urlSearchParamsToObject(urlSearchParams) {
        let result = {},
            entries = urlSearchParams.entries();
        for (let [key, value] of entries) {
            result[key] = value;
        }

        return result;
    }

    // WARNING: For UiScreens, this will call the terminate function! Best idea is to not do anything after
    // calling this!
    loadScreen(screenToLoad, screenParameters, pushIntoBrowserHistory=true) {
        let url, screenClass;

        url = UiScreen.formatUrl(screenToLoad, screenParameters);
        if (pushIntoBrowserHistory) {
            window.history.pushState({}, "", url);
        } else {
            window.history.replaceState({}, "", url);
        }

        this.screen?.terminate();
        this.el.innerHTML = "";

        screenClass = uiScreenRegistry.getClass(screenToLoad);
        if (screenClass === undefined) {
            // TODO: Proper error handling, e.g. redirect to an error screen and pass the bad screen name as a screenParameter?
            console.error(`Tried to access bad screen ${screenToLoad}`);
        } else {
            this.screen = new screenClass(screenParameters);

            this.el.appendChild(this.screen.el);
    
            this.screen.onScreenLoaded();
        }
    }
}

uiScreenSwapper = new UiScreenSwapper();

export { uiScreenSwapper };
import "/app/resources/css/text_layer_builder.css";

import { unused } from "./common/utils.js";
import { Listener } from "./common/model/Observable.js";

import { UiScreen } from "./common/ui/UiScreen.js";
import { UiLoginScreen } from "./screens/login/ui/login.js";
import { UiCreateAccountScreen } from "./screens/create-account/ui/create-account.js";
import { UiDashboardScreen } from "./screens/dashboard/ui/dashboard.js";
import { UiEditorScreen } from "./screens/editor/ui/editor.js";
import { UiNavbar } from "./navbar/navbar.js";

class UiScreenSwapper {
    constructor() {
        this.el = document.querySelector("#screen-swapper");
        this.screen = null;
        this.listener = new Listener();

        window.onpopstate = e => this.onPopState(e);

        this.loadScreenFromUrl();
    }

    // Called when the user navigates back in the browser.
    onPopState(e) {
        // Do not push, otherwise the forward-button won't work.
        this.loadScreenFromUrl(false);

        e.preventDefault();
    }

    loadScreenFromUrl(push=true) {
        // TODO: This is probably not the best place for URL parsing ...
        let screen = (window.location.hash ? location.hash.substring(1) : "login"),
            urlSearchParams = new URLSearchParams(window.location.search),
            screenParameters = this.urlSearchParamsToObject(urlSearchParams);

        this.loadScreen(screen, screenParameters, push);
    }

    urlSearchParamsToObject(urlSearchParams) {
        let result = {},
            entries = urlSearchParams.entries();
        for (let [key, value] of entries) {
            result[key] = value;
        }

        return result;
    }

    loadScreen(screenToLoad, screenParameters, push=true) {
        this.el.innerHTML = "";

        if (push) {
            let url = UiScreen.formatUrl(screenToLoad, screenParameters);
            window.history.pushState({}, "", url);
        }

        if (this.screen !== null) {
            this.screen.terminate();
        }

        switch (screenToLoad) {
            case "login": this.screen = new UiLoginScreen(screenParameters); break;
            case "create-account": this.screen = new UiCreateAccountScreen(screenParameters); break;
            case "dashboard": this.screen = new UiDashboardScreen(screenParameters); break;
            case "editor": this.screen = new UiEditorScreen(screenParameters); break;

            default: break; // TODO: Error-handling.
        }

        this.screen.addEventListener(UiScreen.EVENT_REQUEST_SCREEN_CHANGE, e => this.loadScreen(e.data.screen, e.data.screenParameters), this.listener);
        this.el.appendChild(this.screen.el);

        this.screen.onScreenLoaded();
    }

    terminate() {
        this.listener.terminate();
    }
}

class Ui {
    constructor() {
        this.screenSwapper = new UiScreenSwapper();
        this.navbar = new UiNavbar(this.screenSwapper);
    }

    // Not used at the moment. But let's keep this for consistency.
    terminate() {
        this.screenSwapper.terminate();
    }
}

unused(new Ui());

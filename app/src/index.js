import "/app/resources/css/text_layer_builder.css";

import { unused } from "./common/utils.js";
import { Listener } from "./common/model/Observable.js";

import { UiScreen } from "./common/ui/UiScreen.js";
import { UiLoginScreen } from "./screens/login/ui/login.js";
import { UiCreateAccountScreen } from "./screens/create-account/ui/create-account.js";
import { UiDashboardScreen } from "./screens/dashboard/ui/dashboard.js";
import { UiEditorScreen } from "./screens/editor/ui/editor.js";

class UiScreenSwapper {
    constructor() {
        this.el = document.querySelector("#screen-swapper");
        this.screen = null;
        this.listener = new Listener();
    }

    loadScreen(screenToLoad, screenParameters) {
        this.el.innerHTML = "";

        window.history.pushState({}, "", UiScreen.formatUrl(screenToLoad, screenParameters));

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
    }

    terminate() {
        this.listener.terminate();
    }
}

class Ui {
    constructor() {
        this.screenWrapper = new UiScreenSwapper();

        // TODO: This is probably not the best place for URL parsing ...

        let screen = "login";
        if (window.location.hash) {
            // Hash will also include the # sign.
            screen = location.hash.substring(1);
        }

        let urlSearchParams = new URLSearchParams(window.location.search);
        let screenParameters = this.urlSearchParamsToObject(urlSearchParams);

        this.screenWrapper.loadScreen(screen, screenParameters);
    }

    urlSearchParamsToObject(urlSearchParams) {
        let result = {};

        let entries = urlSearchParams.entries();
        for (let [key, value] of entries) {
            result[key] = value;
        }

        return result;
    }

    // Not used at the moment. But let's keep this for consistency.
    terminate() {
        this.screenWrapper.terminate();
    }
}

unused(new Ui());

window.onpopstate = function(e) {
    unused(e);

    // TODO: Do we want to handle the reload ourselves? Would allow for animations etc.
    location.reload();
};

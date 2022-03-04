import { AccountSession, accountSession, LoginState } from "../model/AccountSession.js";
import { Event, Listener, Observable } from "../model/Observable.js";
import { cloneDomTemplate } from "./dom-utils.js";

class UiScreen extends Observable {
    static EVENT_REQUEST_SCREEN_CHANGE = "REQUEST_SCREEN_CHANGE";

    constructor(templateSelector, screenParameters) {
        super();
        this.el = cloneDomTemplate(templateSelector);
        this.screenParameters = screenParameters;
    }

    // Override this if you need to do initialization that might call requestScreenChange.
    // Should probably try to come up with a better design ...
    onScreenLoaded() {
        return;
    }

    // WARNING: This will call the terminate function! Best idea is to not do anything after
    // calling this!
    requestScreenChange(screen, screenParameters) {
        this.notifyAll(new Event(UiScreen.EVENT_REQUEST_SCREEN_CHANGE, {screen, screenParameters}));
        
        // HACK: Dashboard doesn't load if we change pages, fixing this needs some thought regarding event handling.
        //location.reload();
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

// Screen that is restricted to users that are logged in. Otherwise, redirect to the
// login screen.
// To use this, override: initRestrictedData(), terminateRestrictedData().
// The benefit of this design is that the usage code can rely on the login-restricted data
// being available.
class UiRestrictedScreen extends UiScreen {
    constructor(templateSelector, screenParameters) {
        super(templateSelector, screenParameters);
    }
    
    onScreenLoaded() {
        super.onScreenLoaded();

        this.listener = new Listener();
        this.restrictedInitRan = false;

        this.updateLoginState();
        accountSession.addEventListener(AccountSession.EVENT_LOGIN_STATE_CHANGED, () => this.updateLoginState(), this.listener);
    }

    terminate() {
        super.terminate();

        this.listener.terminate();
        if (this.restrictedInitRan) {
            this.terminateRestricted();
        }
    }

    updateLoginState() {
        switch (accountSession.loginState) {
            case LoginState.LOGGED_IN: {
                if (!this.restrictedInitRan) {
                    this.restrictedInitRan = true;
                    this.initRestricted();
                }
            } break;

            case LoginState.LOGGED_OUT: {
                this.requestScreenChange("login", {});
            } break;

            case LoginState.UNKNOWN: break;
            default: break;
        }
    }

    initRestricted() {
        // Override this.
        return;
    }

    terminateRestricted() {
        // Override this.
        return;
    }
}

export { UiScreen, UiRestrictedScreen };
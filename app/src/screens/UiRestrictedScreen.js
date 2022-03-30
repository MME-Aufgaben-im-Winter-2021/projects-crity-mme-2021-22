import { AccountSession, accountSession, LoginState } from "../common/model/AccountSession.js";
import { Listener } from "../common/model/Observable.js";
import { cloneDomTemplate } from "../common/ui/dom-utils.js";
import { assert } from "../common/utils.js";
import { UiScreen } from "./UiScreen.js";
import { uiScreenSwapper } from "./uiScreenSwapper.js";

// Screen that is restricted to e.g. users that are logged in, or any other rule. Otherwise, redirect to the
// login screen, I guess.
// To use this, override: initRestrictedData(), terminateRestrictedData(), loginStateIsCompatible().
//
// The benefit of this design is that the usage code can rely on the login-restricted data
// being available.
class UiRestrictedScreen extends UiScreen {
    initRestricted() {
        // Override this.
        return;
    }

    terminateRestricted() {
        // Override this.
        return;
    }

    loginStateIsCompatible() {
        // Always override this. Return true if the screen is compatible with accountSession.loginState.
        assert(0);
    }

    redirect() {
        uiScreenSwapper.loadScreen("login", {}, false);
    }

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
        if (accountSession.loginState === LoginState.UNKNOWN) {
            // E.g. the editor needs to "survive" the unknown login state when logging out.
            // Doing that properly involves disabling all UI components while the asynchronous
            // logout and anonymous account creation are running (we will lose control over the main
            // thread while that is happening), and also we need to make sure no callbacks are running.
            // So the approach is to resuscitate the screen once the state is known again.
            // TODO: This is not perfect, since there will still be asynchronous nonsense going on that's related to Appwrite etc.
            // TODO: Also, we will lose any state that is not kept in the screen parameters ...
            if (this.restrictedInitRan) {
                this.terminateRestricted();

                // Ugly, replace the DOM.
                let newEl = cloneDomTemplate(this.templateSelector);
                this.el.parentNode.replaceChild(newEl, this.el);
                this.el = newEl;

                this.restrictedInitRan = false;
            }
        } else {
            let isCompatible = this.loginStateIsCompatible();

            if (isCompatible) {
                if (!this.restrictedInitRan) {
                    this.restrictedInitRan = true;
                    this.initRestricted();
                }
            } else {
                this.redirect();
            }
        }
    }
}

export { UiRestrictedScreen };
import { AccountSession, accountSession, LoginState } from "../common/model/AccountSession.js";
import { Listener } from "../common/model/Observable.js";
import { UiScreen } from "./UiScreen.js";
import { uiScreenSwapper } from "./uiScreenSwapper.js";

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
                
                if(this.screenParameters){
                    accountSession.createAnonymAccount();
                }else{
                    uiScreenSwapper.loadScreen("login", {});
                }
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

export { UiRestrictedScreen };
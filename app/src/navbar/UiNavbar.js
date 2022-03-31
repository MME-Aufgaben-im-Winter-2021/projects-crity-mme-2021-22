import { AccountSession, accountSession, LoginState } from "../common/model/AccountSession.js";
import { Listener } from "../common/model/Observable.js";
import { cloneDomTemplate } from "../common/ui/dom-utils.js";
import { uiScreenSwapper } from "../screens/uiScreenSwapper.js";

// The blue bar at the top: The navbar, that's how they call it.
// We show the navbar regardless of the current screen.
// TODO:Currently, we also manipulate the navbar's DOM elements for some of the fields
// directly (e.g. in UiEditorScreen), a better design would probably be to have the navbar provide
// an API to swap in screen-specific templates (that was the main reason why the navbar was made global).

var uiNavbar;

//////////////////////////////////////////////////////////////////////////////////////////////////
// Navbar panels: The buttons that show up at the right (sign in, user name, etc.).
// This is dependent on the login state:

// When the user is logged in, we show guess what:
class UiLoggedInAccountPanel {
    constructor() {
        this.el = cloneDomTemplate("#logged-in-template");

        this.logOutButtonEl = this.el.querySelector(".id-log-out-button");
        this.logOutButtonEl.addEventListener("click", () => this.onLogOutButtonClicked());

        this.userNameEl = this.el.querySelector(".id-user-name");
        this.userNameEl.textContent = accountSession.accountName;
    }

    onLogOutButtonClicked() {
        accountSession.logOut();
    }

    terminate() {
        return;
    }
}

// When the account session is in the logged out state, we show:
class UiLoggedOutAccountPanel {
    constructor() {
        this.el = cloneDomTemplate("#logged-out-template");

        this.logInButtonEl = this.el.querySelector(".id-log-in-button");
        this.logInButtonEl.addEventListener("click", () => this.onLogInButtonClicked());
    }

    onLogInButtonClicked() {
        uiScreenSwapper.loadScreen("login", {});
    }

    terminate() {
        return;
    }
}

// Responsible for switching between the two navbar panels (see beginning of the file for more details)
class UiAccountPanel {
    constructor() {
        this.el = document.querySelector(".id-account-panel");
        this.listener = new Listener();

        this.currentPanel = null;

        accountSession.addEventListener(AccountSession.EVENT_LOGIN_STATE_CHANGED, () => this.onLoginStateChanged(), this.listener);
    }

    terminate() {
        this.listener.terminate();
    }

    onLoginStateChanged() {
        this.currentPanel?.terminate();
        this.el.innerHTML = "";

        switch (accountSession.loginState) {
            case LoginState.LOGGED_IN: this.currentPanel = new UiLoggedInAccountPanel(); break;
            case LoginState.LOGGED_OUT: this.currentPanel = new UiLoggedOutAccountPanel(); break;

            default: break;
        }

        this.el.appendChild(this.currentPanel.el);
    }
}

// The navbar as a whole.
class UiNavbar {
    constructor() {
        this.el = document.querySelector("#navbar");

        this.logoButtonEl = this.el.querySelector(".id-logo-button");
        this.logoButtonEl.addEventListener("click", () => this.onLogoButtonClicked());

        this.accountPanel = new UiAccountPanel();
    }

    terminate() {
        this.accountPanel.terminate();
    }

    onLogoButtonClicked() {
        // Note that the login page will redirect to the dashboard if a user was logged in.
        uiScreenSwapper.loadScreen("login");
    }
}

uiNavbar = new UiNavbar();

export { UiNavbar, uiNavbar };
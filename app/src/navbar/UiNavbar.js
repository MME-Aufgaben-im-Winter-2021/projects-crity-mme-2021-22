import { AccountSession, accountSession, LoginState } from "../common/model/AccountSession.js";
import { Listener } from "../common/model/Observable.js";
import { cloneDomTemplate } from "../common/ui/dom-utils.js";
import { uiScreenSwapper } from "../screens/uiScreenSwapper.js";

var uiNavbar;

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
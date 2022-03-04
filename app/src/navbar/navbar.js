import { AccountSession, accountSession, LoginState } from "../common/model/AccountSession.js";
import { Listener } from "../common/model/Observable.js";
import { cloneDomTemplate } from "../common/ui/dom-utils.js";

class UiLoggedInAccountPanel {
    constructor() {
        this.el = cloneDomTemplate("#logged-in-template");

        this.logOutButtonEl = this.el.querySelector(".id-log-out-button");
        this.logOutButtonEl.addEventListener("click", () => this.onLogOutButtonClicked());
    }

    onLogOutButtonClicked() {
        accountSession.logOut();
    }

    terminate() {
        return;
    }
}

class UiLoggedOutAccountPanel {
    constructor(uglyScreenSwapper) {
        this.el = cloneDomTemplate("#logged-out-template");

        this.logInButtonEl = this.el.querySelector(".id-log-in-button");
        this.logInButtonEl.addEventListener("click", () => this.onLogInButtonClicked());

        this.uglyScreenSwapper = uglyScreenSwapper;
    }

    onLogInButtonClicked() {
        this.uglyScreenSwapper.loadScreen("login", {});
    }

    terminate() {
        return;
    }
}

class UiAccountPanel {
    constructor(uglyScreenSwapper) {
        this.el = document.querySelector(".id-account-panel");
        this.listener = new Listener();

        this.currentPanel = null;

        this.uglyScreenSwapper = uglyScreenSwapper;

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
            case LoginState.LOGGED_OUT: this.currentPanel = new UiLoggedOutAccountPanel(this.uglyScreenSwapper); break;

            default: break;
        }

        this.el.appendChild(this.currentPanel.el);
    }
}

class UiNavbar {
    // TODO: Passing the screen swapper here seems like a bad a idea due to the
    // circularity of the design. Probably the best solution is to have a global
    // observable tracking the screen state, and then have the screen swapper react
    // to that state?
    constructor(uglyScreenSwapper) {
        this.el = document.querySelector("#navbar");
        this.accountPanel = new UiAccountPanel(uglyScreenSwapper);
    }

    terminate() {
        this.accountPanel.terminate();
    }
}

export { UiNavbar };
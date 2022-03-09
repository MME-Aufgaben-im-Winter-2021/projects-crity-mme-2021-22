import { accountSession, AccountSession, LoginState } from "../../../common/model/AccountSession.js";
import { Listener } from "../../../common/model/Observable.js";
import { UiScreen } from "../../UiScreen.js";
import { uiScreenRegistry } from "../../uiScreenRegistry.js";
import { uiScreenSwapper } from "../../uiScreenSwapper.js";

class UiLoginScreen extends UiScreen {
    static NAME = "login";

    constructor() {
        super("#login-screen-template");

        this.listener = new Listener();

        this.loginFormEl = this.el.querySelector(".id-login-form");
        this.emailInputEl = this.el.querySelector(".id-email-input");
        this.passwordInputEl = this.el.querySelector(".id-password-input");

        this.loginFormEl.addEventListener("submit", (e) => {
            e.preventDefault();
            this.onLogInButtonClicked();
        });

        this.createAccountButtonEl = this.el.querySelector(".id-create-account-button");
        this.createAccountButtonEl.addEventListener("click", () => this.onCreateAccountButtonClicked());

        accountSession.addEventListener(
            AccountSession.EVENT_LOGIN_STATE_CHANGED,
            () => this.onLoginStateChanged(),
            this.listener,
        );
    }

    terminate() {
        super.terminate();
        this.listener.terminate();
    }

    onLoginStateChanged() {
        if (accountSession.loginState === LoginState.LOGGED_IN) {
            uiScreenSwapper.loadScreen("dashboard", {});
        }
    }

    onLogInButtonClicked() {
        let email = this.emailInputEl.value,
            password = this.passwordInputEl.value;
        accountSession.logIn(email, password);
    }

    onCreateAccountButtonClicked() {
        uiScreenSwapper.loadScreen("create-account", {});
    }
}

uiScreenRegistry.add(UiLoginScreen);

export { UiLoginScreen };

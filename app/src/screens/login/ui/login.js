import { UiScreen } from "../../../common/ui/UiScreen.js";
import { accountSession, AccountSession, LoginState } from "../../../common/model/AccountSession.js";

class UiLoginScreen extends UiScreen {
    constructor() {
        super("#login-screen-template");

        this.emailInputEl = this.el.querySelector(".id-email-input");
        this.passwordInputEl = this.el.querySelector(".id-password-input");

        this.logInButtonEl = this.el.querySelector(".id-log-in-button");
        this.logInButtonEl.addEventListener("click", () => this.onLogInButtonClicked());

        this.createAccountButtonEl = this.el.querySelector(".id-create-account-button");
        this.createAccountButtonEl.addEventListener("click", () => this.onCreateAccountButtonClicked());

        accountSession.addEventListener(AccountSession.EVENT_LOGIN_STATE_CHANGED, () => this.onLoginStateChanged());
    }

    onLoginStateChanged() {
        if (accountSession.loginState === LoginState.LOGGED_IN) {
            this.requestScreenChange("dashboard", {});
        }
    }

    onLogInButtonClicked() {
        let email = this.emailInputEl.value;
        let password = this.passwordInputEl.value;
        accountSession.logIn(email, password);
    }

    onCreateAccountButtonClicked() {
        this.requestScreenChange("create-account", {});
    }
}

export { UiLoginScreen };
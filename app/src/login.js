import { AccountSession } from "./common.js";

class LoginScreen {
    constructor() {
        this.accountSession = new AccountSession();
        this.accountSession.addEventListener(AccountSession.EVENT_LOGIN_STATE_CHANGED, () => this.onLoginStateChanged());
    }

    onLoginStateChanged() {
        if (this.accountSession.isLoggedIn) {
            window.location.replace("/dashboard.html");
        }
    }
}

var loginScreen = new LoginScreen();

class UiCreateAccountScreen {
    constructor() {
        this.emailInputEl = document.querySelector("#email-input");
        this.passwordInputEl = document.querySelector("#password-input");

        this.logInButtonEl = document.querySelector("#log-in-button");
        this.logInButtonEl.addEventListener("click", () => this.onLogInButtonClicked());

        this.createAccountButtonEl = document.querySelector("#create-account-button");
    }

    onLogInButtonClicked() {
        let email = this.emailInputEl.value;
        let password = this.passwordInputEl.value;
        loginScreen.accountSession.logIn(email, password);
    }
}

new UiCreateAccountScreen();
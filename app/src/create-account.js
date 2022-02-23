import { AccountSession } from "./common.js";

class CreateAccountData {
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

var data = new CreateAccountData();

class UiLoginScreen {
    constructor() {
        this.emailInputEl = document.querySelector("#name-input");
        this.emailInputEl = document.querySelector("#email-input");
        this.passwordInputEl = document.querySelector("#password-input");

        this.createButtonEl = document.querySelector("#create-button");
        this.createButtonEl.addEventListener("click", () => this.onLogInButtonClicked());
    }

    onLogInButtonClicked() {
        let name = this.nameInput.value;
        let email = this.emailInputEl.value;
        let password = this.passwordInputEl.value;

        (async () => {
            await data.accountSession.createAccount(name, email, password);
            await data.accountSession.logIn(email, password);
        })();
    }
}

new UiLoginScreen();
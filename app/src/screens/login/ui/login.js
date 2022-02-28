import { data, LoginData } from "../model/data.js";

class UiCreateAccountScreen {
    constructor() {
        this.emailInputEl = document.querySelector("#email-input");
        this.passwordInputEl = document.querySelector("#password-input");

        this.logInButtonEl = document.querySelector("#log-in-button");
        this.logInButtonEl.addEventListener("click", () => this.onLogInButtonClicked());

        this.createAccountButtonEl = document.querySelector("#create-account-button");
        this.createAccountButtonEl.addEventListener("click", () => this.onCreateAccountButtonClicked());
    }

    onLogInButtonClicked() {
        let email = this.emailInputEl.value;
        let password = this.passwordInputEl.value;
        data.accountSession.logIn(email, password);
    }

    onCreateAccountButtonClicked() {
        window.location.href = "/create-account.html";
    }
}

new UiCreateAccountScreen();
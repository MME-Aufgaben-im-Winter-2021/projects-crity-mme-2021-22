import { data, CreateAccountData } from "../model/data.js";

class UiLoginScreen {
    constructor() {
        this.nameInputEl = document.querySelector("#name-input");
        this.emailInputEl = document.querySelector("#email-input");
        this.passwordInputEl = document.querySelector("#password-input");

        this.createButtonEl = document.querySelector("#create-button");
        this.createButtonEl.addEventListener("click", () => this.onCreateButtonClicked());
    }

    onCreateButtonClicked() {
        let name = this.nameInputEl.value;
        let email = this.emailInputEl.value;
        let password = this.passwordInputEl.value;

        (async () => {
            await data.accountSession.createAccount(name, email, password);
            await data.accountSession.logIn(email, password);
        })();
    }
}

new UiLoginScreen();
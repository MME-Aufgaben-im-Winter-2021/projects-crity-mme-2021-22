import { accountSession, AccountSession, LoginState } from "../../../common/model/AccountSession.js";
import { Listener } from "../../../common/model/Observable.js";
import { UiRestrictedScreen } from "../../UiRestrictedScreen.js";
import { uiScreenRegistry } from "../../uiScreenRegistry.js";
import { uiScreenSwapper } from "../../uiScreenSwapper.js";

class UiLoginScreen extends UiRestrictedScreen {
    static NAME = "login";

    constructor() {
        super("#login-screen-template");

        this.listener = new Listener();

        this.loginFormEl = this.el.querySelector(".id-login-form");
        this.emailInputEl = this.el.querySelector(".id-email-input");
        this.passwordInputEl = this.el.querySelector(".id-password-input");
        this.message = this.el.querySelector(".id-message");

        this.loginFormEl.addEventListener("submit", (e) => {
            e.preventDefault();
            this.onLogInButtonClicked();
        });

        this.createAccountButtonEl = this.el.querySelector(".id-create-account-button");
        this.createAccountButtonEl.addEventListener("click", () => this.onCreateAccountButtonClicked());

        this.navBarInfo = document.querySelector(".id-info");
        this.navBarInfo.classList.add("hidden");
        this.copyLinkButton = document.querySelector("#copy-link-button");
        this.copyLinkButton.classList.add("hidden");
    }

    loginStateIsCompatible() {
        return accountSession.loginState === LoginState.LOGGED_OUT;
    }

    redirect() {
        uiScreenSwapper.loadScreen("dashboard", {});
    }

    terminate() {
        super.terminate();
        this.listener.terminate();
    }

    onLogInButtonClicked() {
        let email = this.emailInputEl.value,
            password = this.passwordInputEl.value;
        accountSession.logIn(email, password, this.message);
    }

    onCreateAccountButtonClicked() {
        uiScreenSwapper.loadScreen("create-account", {});
    }
}

uiScreenRegistry.add(UiLoginScreen);

export { UiLoginScreen };

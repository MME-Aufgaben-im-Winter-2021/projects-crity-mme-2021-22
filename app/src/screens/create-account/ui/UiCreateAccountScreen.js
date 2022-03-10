import { UiScreen } from "../../UiScreen.js";
import { accountSession, AccountSession, LoginState } from "../../../common/model/AccountSession.js";
import { Listener } from "../../../common/model/Observable.js";
import { uiScreenRegistry } from "../../uiScreenRegistry.js";
import { uiScreenSwapper } from "../../uiScreenSwapper.js";

class UiCreateAccountScreen extends UiScreen {
    static NAME = "create-account";

    constructor() {
        super("#create-account-screen-template");

        this.listener = new Listener();

        this.nameInputEl = this.el.querySelector(".id-name-input");
        this.emailInputEl = this.el.querySelector(".id-email-input");
        this.passwordInputEl = this.el.querySelector(".id-password-input");
        this.confPasswordInputEl = this.el.querySelector(".id-confPassword-input");
        this.message = this.el.querySelector(".id-message");
        this.registerFormEl = this.el.querySelector(".id-register-form");

        this.registerFormEl.addEventListener("submit", (e) => {
            e.preventDefault();
            this.onCreateButtonClicked();
        });

        // FIXME: exactly the same two lines of code already exist in UiNavbar.js.
        //          Maybe there's a way to refactor so the clicklistener for elements
        //          with class ".id-log-in-button" is only registered once?
        this.logInButtonEl = this.el.querySelector(".id-log-in-button");
        this.logInButtonEl.addEventListener("click", () => this.onLogInButtonClicked());

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

    onCreateButtonClicked() {
        let name = this.nameInputEl.value,
            email = this.emailInputEl.value,
            password = this.passwordInputEl.value,
            confPassword = this.confPasswordInputEl.value;

        if (password !== confPassword) {
            this.message.textContent = "Passwords do not match";
        } else {
            this.message.textContent = "";
            (async () => {
                await accountSession.createAccountAndLogIn(name, email, password);
            })();
        }
    }

    onLogInButtonClicked() {
        uiScreenSwapper.loadScreen("login", {});
    }
}

uiScreenRegistry.add(UiCreateAccountScreen);

export { UiCreateAccountScreen };

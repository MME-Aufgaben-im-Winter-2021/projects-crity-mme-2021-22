import { UiScreen } from "../../UiScreen.js";
import { accountSession, AccountSession, LoginState } from "../../../common/model/AccountSession.js";
import { Listener } from "../../../common/model/Observable.js";
import { uiScreenRegistry } from "../../uiScreenRegistry.js";
import { uiScreenSwapper } from "../../uiScreenSwapper.js";

class UiCreateAccountScreen extends UiScreen {
    static NAME = "create-account";

    constructor() {
        super("#create-account-screen-template");

        this.nameInputEl = this.el.querySelector(".id-name-input");
        this.emailInputEl = this.el.querySelector(".id-email-input");
        this.passwordInputEl = this.el.querySelector(".id-password-input");

        this.createButtonEl = this.el.querySelector(".id-create-button");
        this.createButtonEl.addEventListener("click", () => this.onCreateButtonClicked());

        this.listener = new Listener();

        accountSession.addEventListener(AccountSession.EVENT_LOGIN_STATE_CHANGED, () => this.onLoginStateChanged(), this.listener);
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
            password = this.passwordInputEl.value;

        (async () => {
            await accountSession.createAccountAndLogIn(name, email, password);
        })();
    }
}

uiScreenRegistry.add(UiCreateAccountScreen);

export { UiCreateAccountScreen };
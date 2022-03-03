import { UiScreen } from "../../../common/ui/UiScreen.js";
import { accountSession, AccountSession, LoginState } from "../../../common/model/AccountSession.js";

class UiCreateAccountScreen extends UiScreen {
    constructor() {
        super("#create-account-screen-template");

        this.nameInputEl = this.el.querySelector(".id-name-input");
        this.emailInputEl = this.el.querySelector(".id-email-input");
        this.passwordInputEl = this.el.querySelector(".id-password-input");

        this.createButtonEl = this.el.querySelector(".id-create-button");
        this.createButtonEl.addEventListener("click", () => this.onCreateButtonClicked());

        accountSession.addEventListener(AccountSession.EVENT_LOGIN_STATE_CHANGED, () => this.onLoginStateChanged());
    }

    onLoginStateChanged() {
        if (accountSession.loginState === LoginState.LOGGED_IN) {
            this.requestScreenChange("dashboard", {});
        }
    }

    onCreateButtonClicked() {
        let name = this.nameInputEl.value;
        let email = this.emailInputEl.value;
        let password = this.passwordInputEl.value;

        (async () => {
            await accountSession.createAccountAndLogIn(name, email, password);
        })();
    }
}

export { UiCreateAccountScreen };
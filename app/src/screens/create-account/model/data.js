import { AccountSession } from "../../../common/model/AccountSession.js";

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

export {data, CreateAccountData };
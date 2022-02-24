import { Observable, Event } from "./Observable.js";
import { appwrite } from "./appwrite.js";

class AccountSession extends Observable {
    static EVENT_LOGIN_STATE_CHANGED = "EVENT_LOGIN_STATE_CHANGED";

    constructor() {
        super();

        this.loginStateAvailable = false;

        this.isLoggedIn = null;
        this.accountId = null;
        
        this._initAsynchronously();
    }

    emitLoginStateChangedEvent() {
        this.notifyAll(new Event(AccountSession.EVENT_LOGIN_STATE_CHANGED, {}));
    }

    // Does not log in the user!
    async createAccount(name, email, password) {
        let account = await appwrite.account.create("unique()", email, password, name);
        this.fillInAccountData(account);

        this.loginStateAvailable = true;
        this.emitLoginStateChangedEvent();
    }

    async logIn(email, password) {
        try {
            await appwrite.account.createSession(email, password);
            this.isLoggedIn = true;
            this.emitLoginStateChangedEvent();
        } catch (e) {
            // TODO: Error message.
        }
    }

    async _initAsynchronously() {
        await this._checkIfLoggedIn();

        this.loginStateAvailable = true;
        this.emitLoginStateChangedEvent();
    }

    async _checkIfLoggedIn() {
        // TODO: Is there a cleaner way of doing this?

        try {
            let account = await appwrite.account.get();
            this.fillInAccountData(account);
            this.isLoggedIn = true;
        } catch (e) {
            this.isLoggedIn = false;
        }
    }

    fillInAccountData(appwriteAccount) {
        this.accountId = appwriteAccount.$id;
    }
}

export { AccountSession };
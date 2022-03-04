import { Observable, Event } from "./Observable.js";
import { appwrite } from "./appwrite.js";
import { assert } from "../utils.js";

var accountSession;

const LoginState = {
    // The page just finished loading. Where are asynchronously checking if we have any sessions.
    UNKNOWN: "UNKNOWN",

    LOGGED_IN: "LOGGED_IN",
    LOGGED_OUT: "LOGGED_OUT",
};

class AccountSession extends Observable {
    static EVENT_LOGIN_STATE_CHANGED = "EVENT_LOGIN_STATE_CHANGED";

    constructor() {
        super();

        this.loginState = LoginState.UNKNOWN;
        this.p_AccountId = null;
        
        (async () => {
            // Check if already logged in.
            try { 
                // TODO: Is there a cleaner way of doing this?
                let account = await appwrite.account.get();
                this.p_AccountId = account.$id;
                this.loginState = LoginState.LOGGED_IN;
            } catch (e) {
                this.loginState = LoginState.LOGGED_OUT;
            }

            this.notifyAll(new Event(AccountSession.EVENT_LOGIN_STATE_CHANGED, {}));
        })();
    }

    get accountId() {
        assert(this.loginState === LoginState.LOGGED_IN);
        return this.p_AccountId;
    }

    async createAccountAndLogIn(name, email, password) {
        // FIXME: What should we do in the UNKNOWN state?
        assert(this.loginState === LoginState.LOGGED_OUT);

        // TODO: Handle failure.
        await appwrite.account.create("unique()", email, password, name);
        this.logIn(email, password);
    }

    async logIn(email, password) {
        // FIXME: What should we do in the UNKNOWN state?
        assert(this.loginState === LoginState.LOGGED_OUT);

        try {
            let session = await appwrite.account.createSession(email, password);
            this.p_AccountId = session.userId;
            this.loginState = LoginState.LOGGED_IN;
            this.notifyAll(new Event(AccountSession.EVENT_LOGIN_STATE_CHANGED, {}));
        } catch (e) {
            // TODO: Error message.
        }
    }

    onceLoggedInDo(doWhat, listener) {
        if (this.loginState === LoginState.LOGGED_IN) {
            doWhat();
        }

        this.addEventListener(AccountSession.EVENT_LOGIN_STATE_CHANGED, () => {
            if (this.loginState === LoginState.LOGGED_IN) {
                doWhat();
            }
        }, listener);
    }
}

accountSession = new AccountSession();
export { LoginState, AccountSession, accountSession };
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
        this.p_accountId = null;
        
        (async () => {
            // Check if already logged in.
            try { 
                // TODO: Is there a cleaner way of doing this?
                let account = await appwrite.account.get();
                this.p_accountId = account.$id;
                this.p_changeLoginState(LoginState.LOGGED_IN);
            } catch (e) {
                this.p_changeLoginState(LoginState.LOGGED_OUT);
            }
        })();
    }

    get accountId() {
        assert(this.loginState === LoginState.LOGGED_IN);
        return this.p_accountId;
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
            this.p_accountId = session.userId;
            this.p_changeLoginState(LoginState.LOGGED_IN);
        } catch (e) {
            // TODO: Error message.
        }
    }

    async logOut() {
        assert(this.loginState === LoginState.LOGGED_IN);

        // Do this first I guess, to prevent people from using the account while
        // we're waiting for the server response.
        this.p_changeLoginState(LoginState.UNKNOWN);

        await appwrite.account.deleteSession("current");
        
        this.p_changeLoginState(LoginState.LOGGED_OUT);
    }

    onceLoginStateIsKnownDo(doWhat, listener) {
        if (this.loginState !== LoginState.UNKNOWN) {
            doWhat();
        } else {
            let alreadyCalled = false;
            this.addEventListener(AccountSession.EVENT_LOGIN_STATE_CHANGED, () => {
                if (!alreadyCalled && this.loginState !== LoginState.UNKNOWN) {
                    alreadyCalled = true;
                    doWhat();
                }
            }, listener);
        }
    }

    onceLoggedInDo(doWhat, listener) {
        if (this.loginState === LoginState.LOGGED_IN) {
            doWhat();
        } else {
            let alreadyCalled = false;
            this.addEventListener(AccountSession.EVENT_LOGIN_STATE_CHANGED, () => {
                if (!alreadyCalled && this.loginState === LoginState.LOGGED_IN) {
                    alreadyCalled = true;
                    doWhat();
                }
            }, listener);
        }
    }

    p_changeLoginState(loginState) {
        this.loginState = loginState;
        this.notifyAll(new Event(AccountSession.EVENT_LOGIN_STATE_CHANGED, {}));
    }
}

accountSession = new AccountSession();
export { LoginState, AccountSession, accountSession };
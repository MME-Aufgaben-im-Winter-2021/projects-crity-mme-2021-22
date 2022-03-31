import { Observable, Event } from "./Observable.js";
import { appwrite } from "./appwrite.js";
import { assert } from "../utils.js";

var accountSession;

// Account Session: The state machine that tracks the current login state of the user.
// The code is quite hairy, mainly due to the fact that login and logout are asynchronous,
// and switching that state without a full page refresh can introduce all sorts of nasty bugs
// (e.g. what if the user clicks a button that relies on either an anonymous or non-anonymous account
// being present, but we have none since the asynchronous logout is happening).

// In Appwrite, no data can be posted (or read?) without some session. However, Appwrite provides so-called
// "anonymous sessions," which we can use to be able to show presentations to users that are not presently
// logged in.
// The AccountSession abstracts away the distinction between logged-out and logged-in-anonymously, it will
// always try to create an anonymous session for users that are logged out, and only assume the "LOGGED_OUT"
// state once that anonymous session is created.

const LoginState = {
    // The page just finished loading. Where are asynchronously checking if we have any sessions.
    // Or: we are currently trying to log into an anonymous session. Etc.
    // WARNING: Make sure the user is not able to use any UI-element that might try to change the account session!
    UNKNOWN: "UNKNOWN",

    // The user is logged in with a non-anonymous account.
    LOGGED_IN: "LOGGED_IN",

    // The user is currently in an anonymous session.
    LOGGED_OUT: "LOGGED_OUT",
};

class AccountSession extends Observable {
    static EVENT_LOGIN_STATE_CHANGED = "EVENT_LOGIN_STATE_CHANGED";

    constructor() {
        super();

        this.loginState = LoginState.UNKNOWN;

        // Only available when in the LOGGED_IN state.
        this.pAccountId = null;
        
        (async () => {
            // Fill in the login state.

            try {
                // TODO: Is there a cleaner way of checking whether there is a session at all (without the try-catch)?

                let session = await appwrite.account.getSession("current");
                
                if (session.provider === "anonymous") {
                    this.pChangeLoginState(LoginState.LOGGED_OUT);
                } else {
                    await this.pUpdateAccountData();
                    this.pChangeLoginState(LoginState.LOGGED_IN);
                }
            } catch (e) {
                await this.createAnonymousSession();
            }
        })();
    }

    get accountId() {
        assert(this.loginState === LoginState.LOGGED_IN);
        return this.pAccountId;
    }

    get accountName() {
        assert(this.loginState === LoginState.LOGGED_IN);
        return this.pAccountName;
    }

    async createAnonymousSession() {
        this.pChangeLoginState(LoginState.UNKNOWN);

        // This returns a session, not an account! But when don't need it, Appwrite
        // stores the current session ID for us.
        await appwrite.account.createAnonymousSession();

        this.pChangeLoginState(LoginState.LOGGED_OUT);
    }

    async destroyAnonymousSession() {
        // TODO: According to the Appwrite documentation, there is no way to _actually_ destroy a user. We can only block them.
        // https://appwrite.io/docs/client/account#accountDelete
        // So the only way out to kill stale accounts is on the server.
        
        // Kill the session.
        await appwrite.account.deleteSession("current");
    }

    async createAccountAndLogIn(name, email, password) {
        // Always be sure that no UI component is live while we are not in the right state.
        assert(this.loginState === LoginState.LOGGED_OUT);

        // TODO: Handle failure. (UPDATE: No longer that urgent, since the browser checks password length for us now. BUT this 
        // can still fail if the email is already associated to an account!).
        await appwrite.account.create("unique()", email, password, name);
        this.logIn(email, password);
    }

    logIn(email, password, message) {
        // Always be sure that no UI component is live while we are not in the right state.
        assert(this.loginState === LoginState.LOGGED_OUT);

        this.pChangeLoginState(LoginState.UNKNOWN);
        (async () => {
            await this.destroyAnonymousSession();

            try {
                await appwrite.account.createSession(email, password);
                await this.pUpdateAccountData();
                this.pChangeLoginState(LoginState.LOGGED_IN);
            } catch (e) {
                message.textContent = "Wrong e-mail or password";
            }
        })();
    }

    async logOut() {
        assert(this.loginState === LoginState.LOGGED_IN);

        // Do this first I guess, to prevent people from using the account while
        // we're waiting for the server response.
        this.pChangeLoginState(LoginState.UNKNOWN);

        await appwrite.account.deleteSession("current");
        await this.createAnonymousSession();
    }

    // We keep an internal copy of the account data we are interested in, to avoid
    // tons of requests.
    async pUpdateAccountData() {            
        let account = await appwrite.account.get();
        this.pAccountId = account.$id;
        this.pAccountName = account.name;
    }

    pChangeLoginState(loginState) {
        if (this.loginState === loginState) {
            return;
        }

        if (loginState === LoginState.LOGGED_IN) {
            // Make sure we update the account data _before_ calling this function.
            assert(this.pAccountId !== null);
        }

        this.loginState = loginState;
        this.notifyAll(new Event(AccountSession.EVENT_LOGIN_STATE_CHANGED, {}));
    }
}

accountSession = new AccountSession();
export { LoginState, AccountSession, accountSession };
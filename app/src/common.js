import {Observable, Event} from "./Observable.js";

var appwrite = new Appwrite();
appwrite
    .setEndpoint("https://appwrite.software-engineering.education/v1")
    .setProject(/* crity */ "6206644928ab8835c77f");

// Array + Events.
class ObservableArray extends Observable {
    static EVENT_ITEM_ADDED = "ITEM_ADDED";
    static EVENT_CLEARED = "CLEARED";
    
    // TODO: Add those?
    //static EVENT_ITEM_REMOVED = "ITEM_REMOVED";
    //static EVENT_FULL_UPDATE = "FULL_UPDATE";

    constructor() {
        super();
        this.items = [];
    }

    push(item) {
        this.items.push(item);
        this.notifyAll(new Event(ObservableArray.EVENT_ITEM_ADDED, {item}));
    }

    clear() {
        this.items.length = 0;
        this.notifyAll(new Event(ObservableArray.EVENT_CLEARED, {}));
    }

    getFirst() {
        if (this.items.length === 0) {
            return null;
        }

        return this.items[0];
    }

    getLast() {
        if (this.items.length === 0) {
            return null;
        }
        
        return this.items[this.items.length - 1];
    }
}

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

// IIRC, calling clone on the template directly produces a document fragment;
// this causes subtle issues when working with the fragment that are not
// very fun to debug. This method has proven more reliable thus far.
function cloneDomTemplate(id) {
    let templateEl = document.querySelector(id);
    return templateEl.content.firstElementChild.cloneNode(true);
}

export {appwrite, cloneDomTemplate, AccountSession, ObservableArray};

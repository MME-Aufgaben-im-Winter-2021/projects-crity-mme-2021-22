import { AccountSession, accountSession, LoginState } from "../../../common/model/AccountSession.js";
import { Observable, Event, Listener } from "../../../common/model/Observable.js";
import { PresentationList } from "../../../common/model/PresentationList.js";

var data;

class DashboardData extends Observable {
    static EVENT_PRESENTATION_LIST_AVAILABLE = "PRESENTATION_LIST_AVAILABLE";

    constructor() {
        super();
        this.presentationList = null;
        this.listener = new Listener();
        accountSession.addEventListener(AccountSession.EVENT_LOGIN_STATE_CHANGED, () => this.onLoginStateChanged(), this.listener);
    }

    terminate() {
        super.terminate();
        this.presentationList.terminate();
        this.listener.terminate();
    }

    onLoginStateChanged() {
        if (accountSession.loginState === LoginState.LOGGED_IN) {
            this.presentationList = new PresentationList();
            this.notifyAll(new Event(DashboardData.EVENT_PRESENTATION_LIST_AVAILABLE, {}));
        }
    }
}

function initData() {
    data = new DashboardData();
}

function terminateData() {
    data.terminate();
    data = null;
}

export { DashboardData, data, initData, terminateData };
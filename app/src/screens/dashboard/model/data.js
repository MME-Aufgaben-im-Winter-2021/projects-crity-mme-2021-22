import { accountSession } from "../../../common/model/AccountSession.js";
import { Observable, Event, Listener } from "../../../common/model/Observable.js";
import { PresentationList } from "../../../common/model/PresentationList.js";

var data;

class DashboardData extends Observable {
    static EVENT_PRESENTATION_LIST_AVAILABLE = "PRESENTATION_LIST_AVAILABLE";

    constructor() {
        super();
        this.presentationList = null;
        this.listener = new Listener();
        accountSession.onceLoggedInDo(() => this.onLogin(), this.listener);
    }

    onLogin() {
        this.presentationList = new PresentationList();
        this.notifyAll(new Event(DashboardData.EVENT_PRESENTATION_LIST_AVAILABLE, {}));
    }

    terminate() {
        super.terminate();
        this.presentationList.terminate();
        this.listener.terminate();
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
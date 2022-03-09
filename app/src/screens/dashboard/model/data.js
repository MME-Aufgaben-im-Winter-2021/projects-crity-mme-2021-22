import { accountSession, LoginState } from "../../../common/model/AccountSession.js";
import { Observable } from "../../../common/model/Observable.js";
import { PresentationList } from "../../../common/model/PresentationList.js";
import { assert } from "../../../common/utils.js";

var data;

class DashboardData extends Observable {
    constructor() {
        super();

        assert(accountSession.loginState === LoginState.LOGGED_IN);

        this.presentationList = null;
        this.presentationList = new PresentationList();
    }

    terminate() {
        super.terminate();
        this.presentationList.terminate();
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
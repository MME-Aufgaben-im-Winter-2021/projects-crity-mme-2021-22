import { AccountSession } from "../../../common/model/AccountSession.js";
import { PresentationList } from "../../../common/model/PresentationList.js";

class DashboardData {
    constructor() {
        this.accountSession = new AccountSession();
        this.presentationList = new PresentationList(this.accountSession);
    }
}

var data = new DashboardData();

export { data, DashboardData };
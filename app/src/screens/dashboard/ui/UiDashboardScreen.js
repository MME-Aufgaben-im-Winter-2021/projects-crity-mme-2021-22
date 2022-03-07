import { UiRestrictedScreen } from "../../UiRestrictedScreen.js";
import { uiScreenRegistry } from "../../uiScreenRegistry.js";
import { initData, terminateData } from "../model/data.js";
import { UiPresentationCreation } from "./UiPresentationCreation.js";
import { UiPresentationList } from "./UiPresentationList.js";

class UiDashboardScreen extends UiRestrictedScreen {
    static NAME = "dashboard";

    constructor() {
        super("#dashboard-screen-template");
    }

    initRestricted() {
        initData();
        this.presentationList = new UiPresentationList(this);
        this.presentationCreation = new UiPresentationCreation(this);
    }

    terminateRestricted() {
        this.presentationList.terminate();
        terminateData();
    }
}

uiScreenRegistry.add(UiDashboardScreen);

export { UiDashboardScreen };
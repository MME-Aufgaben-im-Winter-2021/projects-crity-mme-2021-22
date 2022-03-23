import { UiRestrictedScreen } from "../../UiRestrictedScreen.js";
import { uiScreenRegistry } from "../../uiScreenRegistry.js";
import { initData, terminateData } from "../model/data.js";
import { UiPresentationCreation } from "./UiPresentationCreation.js";
import { UiPresentationList } from "./UiPresentationList.js";
import { appwrite } from "../../../common/model/appwrite.js";

class UiDashboardScreen extends UiRestrictedScreen {
    static NAME = "dashboard";

    constructor() {
        super("#dashboard-screen-template");
    }

    initRestricted() {
        initData();
        this.presentationList = new UiPresentationList(this);
        this.presentationCreation = new UiPresentationCreation(this);

        this.navBarInfo = document.querySelector(".id-info");
        this.userName = document.querySelector(".id-user-name");
        this.getUserNameForNavBar();
        this.navBarInfo.classList.add("hidden");
        this.copyLinkButton = document.querySelector("#copy-link-button");
        this.copyLinkButton.classList.add("hidden");
    }

    async getUserNameForNavBar() {
        let account = await appwrite.account.get();
        this.userName.textContent = account.name;
    }

    terminateRestricted() {
        this.presentationList.terminate();
        terminateData();
    }
}

uiScreenRegistry.add(UiDashboardScreen);

export { UiDashboardScreen };
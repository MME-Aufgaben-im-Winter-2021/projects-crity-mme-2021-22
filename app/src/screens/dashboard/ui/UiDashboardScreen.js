import { UiRestrictedScreen } from "../../UiRestrictedScreen.js";
import { uiScreenRegistry } from "../../uiScreenRegistry.js";
import { initData, terminateData } from "../model/data.js";
import { UiPresentationCreation } from "./UiPresentationCreation.js";
import { UiPresentationList } from "./UiPresentationList.js";
import { accountSession, LoginState } from "../../../common/model/AccountSession.js";

class UiDashboardScreen extends UiRestrictedScreen {
    static NAME = "dashboard";

    constructor() {
        super("#dashboard-screen-template");
    }

    initRestricted() {
        initData();
        this.presentationList = new UiPresentationList(this);
        this.presentationCreation = new UiPresentationCreation(this);

        // TODO: This code is all over the place, see my TODO in the navbar for how this could be refactored.
        this.navBarInfo = document.querySelector(".id-info");
        this.userName = document.querySelector(".id-user-name");
        this.navBarInfo.classList.add("hidden");
        this.copyLinkButton = document.querySelector("#copy-link-button");
        this.copyLinkButton.classList.add("hidden");
    }

    terminateRestricted() {
        this.presentationList.terminate();
        terminateData();
    }

    loginStateIsCompatible() {
        return accountSession.loginState === LoginState.LOGGED_IN;
    }
}

uiScreenRegistry.add(UiDashboardScreen);

export { UiDashboardScreen };
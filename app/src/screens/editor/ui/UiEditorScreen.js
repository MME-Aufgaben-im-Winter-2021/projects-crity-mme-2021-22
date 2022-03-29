import { initData, terminateData } from "../model/data.js";
import { UiTimeline } from "./timeline/UiTimeline.js";
import { uiScreenRegistry } from "../../uiScreenRegistry.js";
import { appwrite } from "../../../common/model/appwrite.js";
import { UiEditorMainContainer } from "./UiEditorMainContainer.js";
import { UiRestrictedScreen } from "../../UiRestrictedScreen.js";
import { accountSession, LoginState } from "../../../common/model/AccountSession.js";

// TODO: We probably won't want to inherit from restricted screen, since people
// should be able to add comments without an account? That doesn't work at the
// moment, so for now this is probably okay.
class UiEditorScreen extends UiRestrictedScreen {
    static NAME = "editor";

    constructor(screenParameters) {
        super("#editor-screen-template", screenParameters);
    }

    loginStateIsCompatible() {
        return true;
    }

    initRestricted() {
        initData(this.screenParameters.presentation);

        // TODO: Move navbar-related code out of UiEditorScreen.
        this.navBarInfo = document.querySelector(".id-info");
        this.navBarInfo.classList.remove("hidden");
        this.getProjectDataForNavbar();
        this.copyLinkButton = document.querySelector("#copy-link-button");
        this.copyLinkButton.classList.remove("hidden");
        this.copyLinkButton.addEventListener("click", () => this.onCopyLinkButtonClicked());

        this.mainContainer = new UiEditorMainContainer(this);
        this.timeline = new UiTimeline(this);
    }

    terminateRestricted() {
        this.mainContainer.terminate();
        this.timeline.terminate();

        terminateData();
    }

    async getProjectDataForNavbar() {
        let appwritePresentation = await appwrite.database.getDocument("presentations", this.screenParameters.presentation),
            account = await appwrite.account.get();

        this.navBarInfo.textContent = appwritePresentation.title;
    }

    onCopyLinkButtonClicked() {
        navigator.clipboard.writeText(window.location.href);

        // TODO: Make this a custom popup (like we do with the presentation creation dialog).
        //alert("URL copied to clipboard!!!");
    }
}

uiScreenRegistry.add(UiEditorScreen);

export { UiEditorScreen };
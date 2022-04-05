import { initData, terminateData } from "../model/data.js";
import { UiTimeline } from "./timeline/UiTimeline.js";
import { uiScreenRegistry } from "../../uiScreenRegistry.js";
import { appwrite } from "../../../common/model/appwrite.js";
import { UiEditorMainContainer } from "./UiEditorMainContainer.js";
import { UiRestrictedScreen } from "../../UiRestrictedScreen.js";
import { accountSession } from "../../../common/model/AccountSession.js"

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
        this.copyLinkButton = document.querySelector("#copy-link-button");
        this.copyLinkButton.classList.remove("hidden");
        this.copyLinkButton.addEventListener("click", () => this.onCopyLinkButtonClicked());

        this.tooltipCloseButton = document.querySelector(".close-tooltip-button");
        this.tooltipCloseButton.addEventListener("click", () => this.onTooltipButtonClose());
        this.tooltipContainer = document.querySelector(".tooltip-container");

        this.mainContainer = new UiEditorMainContainer(this);
        this.timeline = new UiTimeline(this);

        this.setUpUserRelatedData();
    }

    terminateRestricted() {
        this.mainContainer.terminate();
        this.timeline.terminate();

        terminateData();
    }

    async setUpUserRelatedData() {
        let appwritePresentation = await appwrite.database.getDocument("presentations", this.screenParameters.presentation);
        let text;
        if(appwritePresentation.author === accountSession.pAccountId) {
            text = appwritePresentation.title + " (Author)";
            this.timeline.setAuthorRestriction(true);
        }else{
            text = appwritePresentation.title;
            this.timeline.setAuthorRestriction(false);
        }
        this.navBarInfo.textContent = text;
    }

    onCopyLinkButtonClicked() {
        navigator.clipboard.writeText(window.location.href);

        // TODO: Make this a custom popup (like we do with the presentation creation dialog).
        //alert("URL copied to clipboard!!!");
    }

    onTooltipButtonClose() {
        this.tooltipContainer.classList.toggle("hidden");
    }
}

uiScreenRegistry.add(UiEditorScreen);

export { UiEditorScreen };
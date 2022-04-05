import { initData, terminateData } from "../model/data.js";
import { UiTimeline } from "./timeline/UiTimeline.js";
import { uiScreenRegistry } from "../../uiScreenRegistry.js";
import { appwrite } from "../../../common/model/appwrite.js";
import { UiEditorMainContainer } from "./UiEditorMainContainer.js";
import { UiRestrictedScreen } from "../../UiRestrictedScreen.js";
import { accountSession } from "../../../common/model/AccountSession.js";
import { KeyCodes } from "../../../common/ui/dom-utils.js";

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
        this.controlsTooltip = document.querySelector(".id-controls-tooltip");
        this.usernameTooltip = document.querySelector(".id-username-tooltip");

        
        if(this.getCookie() === "tooltip") {
            this.controlsTooltip.classList.toggle("hidden");
        }
        if(accountSession.pAccountName !== undefined) {
            this.usernameTooltip.classList.toggle("hidden");
        }else{
            this.displayNameInput = document.querySelector(".id-display-name");
            accountSession.pAccountName = "Unknown";
            this.displayNameInput.addEventListener("keydown", e => this.onKeyDown(e));
        }
        
        this.setUpUserRelatedData();
        this.mainContainer = new UiEditorMainContainer(this);
        this.timeline = new UiTimeline(this);
    }

    terminateRestricted() {
        this.mainContainer.terminate();
        this.timeline.terminate();

        terminateData();
    }

    onKeyDown(e) {
        if(e.keyCode !== KeyCodes.ENTER) {
            return;
        }
        accountSession.pAccountName = this.displayNameInput.value;
        this.usernameTooltip.classList.toggle("hidden");
    }

    async setUpUserRelatedData() {
        let appwritePresentation = await appwrite.database.getDocument("presentations", this.screenParameters.presentation);
        let text;
        if(appwritePresentation.author === accountSession.pAccountId) {
            text = appwritePresentation.title + " (Author)";
            this.timeline.setAuthorRestriction(true);
            this.authorMode = true;
        }else{
            text = appwritePresentation.title;
            this.timeline.setAuthorRestriction(false);
            this.authorMode = false;
        }
        this.navBarInfo.textContent = text;
    }

    onCopyLinkButtonClicked() {
        navigator.clipboard.writeText(window.location.href);

        // TODO: Make this a custom popup (like we do with the presentation creation dialog).
        //alert("URL copied to clipboard!!!");
        let copyLinkAlert = document.querySelector(".id-copyLink-tooltip");
        copyLinkAlert.classList.toggle("hidden");
        setTimeout(function() {
            copyLinkAlert.classList.toggle("hidden");
        }, 3000);
    }

    onTooltipButtonClose() {
        this.controlsTooltip.classList.toggle("hidden");
        this.setCookie("tooltip", 100);
    }

    setCookie(value, days) {
        const date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        let expires = "expires="+ date.toUTCString();
        document.cookie = value + ";" + expires + ";path=/";
    }

    getCookie() {
        let decodedCookie = decodeURIComponent(document.cookie);
        return decodedCookie;
    }
}

uiScreenRegistry.add(UiEditorScreen);

export { UiEditorScreen };
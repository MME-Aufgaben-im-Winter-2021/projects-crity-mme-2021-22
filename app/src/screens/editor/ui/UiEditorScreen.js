import { initData, terminateData } from "../model/data.js";
import { UiRestrictedScreen } from "../../UiRestrictedScreen.js";
import { UiThumbnailBar } from "./thumbnail-sidebar/UiThumbnailBar.js";
import { UiContentCenter } from "./content-center/UiContentCenter.js";
import { UiTimeline } from "./timeline/UiTimeline.js";
import { UiRightSidebar } from "./comment-sidebar/UiRightSidebar.js";
import { uiScreenRegistry } from "../../uiScreenRegistry.js";
import { appwrite } from "../../../common/model/appwrite.js";

// TODO: We probably won't want to inherit from restricted screen, since people
// should be able to add comments without an account? That doesn't work at the
// moment, so for now this is probably okay.
class UiEditorScreen extends UiRestrictedScreen {
    static NAME = "editor";

    constructor(screenParameters) {
        super("#editor-screen-template", screenParameters);
    }

    initRestricted() {
        initData(this.screenParameters.presentation);

        this.navBarInfo = document.querySelector(".id-info");
        this.navBarInfo.classList.remove("hidden");
        this.userName = document.querySelector(".id-user-name");
        this.getProjectDataForNavbar();
        this.copyLinkButton = document.querySelector("#copy-link-button");
        this.copyLinkButton.classList.remove("hidden");
        this.copyLinkButton.addEventListener("click", e => this.onCopyLinkButtonClicked(e));

        this.thumbnailBar = new UiThumbnailBar(this);
        this.contentCenter = new UiContentCenter(this);
        this.timeline = new UiTimeline(this);
        this.rightSideBar = new UiRightSidebar(this);
    }

    terminateRestricted() {
        this.rightSideBar.terminate();
        this.timeline.terminate();
        this.contentCenter.terminate();
        this.thumbnailBar.terminate();

        terminateData();
    }

    async getProjectDataForNavbar() {
        let appwritePresentation = await appwrite.database.getDocument("presentations", this.screenParameters.presentation),
            account = await appwrite.account.get();

        this.navBarInfo.textContent = appwritePresentation.title;
        this.userName.textContent= account.name;
    }

    onCopyLinkButtonClicked(e) {

        navigator.clipboard.writeText(window.location.href);

        alert("URL copied to clipboard!!!");
    }
}

uiScreenRegistry.add(UiEditorScreen);

export { UiEditorScreen };
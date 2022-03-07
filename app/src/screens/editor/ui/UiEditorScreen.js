import { initData, terminateData } from "../model/data.js";
import { UiRestrictedScreen } from "../../UiRestrictedScreen.js";
import { UiThumbnailBar } from "./thumbnail-sidebar/UiThumbnailBar.js";
import { UiContentCenter } from "./UiContentCenter.js";
import { UiTimeline } from "./timeline/UiTimeline.js";
import { UiRightSidebar } from "./comment-sidebar/UiRightSidebar.js";
import { uiScreenRegistry } from "../../uiScreenRegistry.js";

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
}

uiScreenRegistry.add(UiEditorScreen);

///////////////////////////////////////////////////////////////////////////////////////
// Uber function testing.
// TODO: Remove this.

import { runUberFunc } from "../../../common/model/runUberFunc.js";

function timeUberFunc() {
    (async () => {
        console.time("uberFunctionRoundtripTime");
        var response = await runUberFunc();
        console.timeEnd("uberFunctionRoundtripTime");
        
        console.log("Uber function responded:", response);
    })();
}

export { UiEditorScreen };
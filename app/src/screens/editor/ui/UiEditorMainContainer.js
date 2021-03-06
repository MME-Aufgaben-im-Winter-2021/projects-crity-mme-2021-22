import { data } from "../model/data.js";
import { UiThumbnailBar } from "./thumbnail-sidebar/UiThumbnailBar.js";
import { UiContentCenter } from "./content-center/UiContentCenter.js";
import { UiRightSidebar } from "./comment-sidebar/UiRightSidebar.js";
import { EditorSelTracker } from "../model/EditorSelTracker.js";
import { cloneDomTemplate } from "../../../common/ui/dom-utils.js";
import { Listener } from "../../../common/model/Observable.js";
import { VersionPdf } from "../../../common/model/VersionPdf.js";

// The main container: The area underneath the timeline, where 
// - the active version gets shown after it has loaded (UiLoadedVersion)
// - a load screen gets shown while it gets loaded (UiLoadingVersion).

class UiLoadedVersion {
    constructor(editorScreen) {
        this.el = cloneDomTemplate("#editor-loaded-version");

        this.thumbnailBar = new UiThumbnailBar(this);
        this.contentCenter = new UiContentCenter(this);
        this.rightSideBar = new UiRightSidebar(this, editorScreen);
    }

    terminate() {
        this.rightSideBar.terminate();
        this.contentCenter.terminate();
        this.thumbnailBar.terminate();
    }
}

// TODO: Ideally, we would like to show a progress bar, but this doesn't seem possible since
// the Appwrite server doesn't send a ContentLength header?
class UiLoadingVersion {
    constructor() {
        this.el = cloneDomTemplate("#editor-loading-version");
    }

    terminate() {
        return;
    }
}

class UiEditorMainContainer {
    constructor(screen) {
        this.editorScreen = screen;
        this.el = screen.el.querySelector(".id-main-container");

        this.listener = new Listener();
        data.selTracker.addEventListener(EditorSelTracker.EVENT_ACTIVE_VERSION_CHANGED, () => this.onActiveVersionChanged(), this.listener);

        this.currentContent = null;
    }

    setContent(newContent) {
        this.currentContent?.terminate();
        this.currentContent = newContent;

        this.el.innerHTML = "";
        this.el.appendChild(this.currentContent.el);
    }

    onActiveVersionChanged() {
        this.setContent(new UiLoadingVersion());
        data.selTracker.pdf.addEventListener(VersionPdf.EVENT_PDF_LOADED, () => this.onPdfLoaded(), this.listener);
    }

    onPdfLoaded() {
        this.setContent(new UiLoadedVersion(this.editorScreen));
    }

    terminate() {
        this.listener.terminate();
        this.currentContent.terminate();
    }
}

export { UiEditorMainContainer };
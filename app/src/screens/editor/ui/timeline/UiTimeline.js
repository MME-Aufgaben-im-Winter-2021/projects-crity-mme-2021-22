import { Listener } from "../../../../common/model/Observable.js";
import { ObservableArray } from "../../../../common/model/ObservableArray.js";
import { data } from "../../model/data.js";
import { UiTimelineGraph } from "./UiTimelineGraph.js";

class UiTimeline {
    constructor(screen) {
        this.el = screen.el.querySelector(".timeline-content");

        this.addVersionButtonEl = screen.el.querySelector(".id-add-version-button");
        this.addVersionButtonEl.addEventListener("click", () => this.onAddButtonClicked());

        // Hidden file input element, we only use this to open a file dialog box.
        this.fileInputEl = screen.el.querySelector(".id-file-input");
        this.fileInputEl.addEventListener("change", () => this.onFileSelectorConcluded());

        this.listener = new Listener();
        data.versionList.versions.addEventListener(ObservableArray.EVENT_ITEM_ADDED, e => this.onVersionAdded(e), this.listener);

        this.timelineContent = document.querySelector(".timeline-content");
        this.timelineHideButton = document.querySelector(".timeline-hide-button");
        this.timelineHideButton.addEventListener("click", () => this.timelineHideButtonClicked());
        this.timelineHeader = document.querySelector(".timeline-header");
        this.mainScreen = document.querySelector(".main-screen");
        this.arrowUp = document.querySelector(".timeline-arrow-up");
        this.arrowDown = document.querySelector(".timeline-arrow-down");

        this.versions = [];
        this.selectedVersion = null;
        this.graph = new UiTimelineGraph(this);
    }
    
    nodeSelected(nodeId) {
        this.selectedVersion = nodeId;
    }

    nodeDoubleClicked(nodeId) {
        let version = this.versions.find(x => x.appwriteId === nodeId);
        data.selTracker.activateVersion(version);
        this.graph.startColorChange(nodeId);
    }

    timelineHideButtonClicked() {
        if(this.timelineContent.style.display === "none") {
            this.timelineContent.style.display = "flex";
            this.arrowUp.classList.add("hidden");
            this.arrowDown.classList.remove("hidden");
        }else{
            this.timelineContent.style.display = "none";
            this.arrowUp.classList.remove("hidden");
            this.arrowDown.classList.add("hidden");
        }
    }

    terminate() {
        this.listener.terminate();
    }

    onVersionAdded(e) {
        /*
        let version = e.data.item;
        let uiVersion = new UiTimelineVersion(version);
        this.el.insertBefore(uiVersion.el, this.addVersionButtonEl);
        */
        this.versions.push(e.data.item);
        this.graph.versionAdded(e.data.item, this);
    }

    onAddButtonClicked() {
        // Open a file dialog.
        this.fileInputEl.click();
    }

    async onFileSelectorConcluded() {
        let version = await data.versionList.createVersion(data.presentationId, "V"+(data.versionList.versions.items.length+1), this.fileInputEl.files[0], this.selectedVersion);
        data.selTracker.activateVersion(version);

        // This is needed to get the change event even when the user uploads the same file twice.
        this.fileInputEl.value = null;
    }
}

export { UiTimeline };
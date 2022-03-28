import { Listener } from "../../../../common/model/Observable.js";
import { ObservableArray } from "../../../../common/model/ObservableArray.js";
import { data } from "../../model/data.js";
import { UiTimelineVersion } from "./UiTimelineVersion.js";
import { UiTimelineGraph } from "./UiTimelineGraph.js";

class UiTimeline {
    constructor(screen) {
        this.el = screen.el.querySelector(".id-version-list");

        this.addVersionButtonEl = screen.el.querySelector(".id-add-version-button");
        this.addVersionButtonEl.addEventListener("click", () => this.onAddButtonClicked());

        // Hidden file input element, we only use this to open a file dialog box.
        this.fileInputEl = screen.el.querySelector(".id-file-input");
        this.fileInputEl.addEventListener("change", () => this.onFileSelectorConcluded());

        this.listener = new Listener();
        data.versionList.versions.addEventListener(ObservableArray.EVENT_ITEM_ADDED, e => this.onVersionAdded(e), this.listener);

        this.timelineWindow = document.querySelector(".id-bottom-bar");
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
        if(this.timelineWindow.style.display === "none") {
            this.timelineWindow.style.display = "block";
            this.timelineWindow.insertBefore(this.timelineHeader, this.el);
            this.arrowUp.classList.add("hidden");
            this.arrowDown.classList.remove("hidden");
        }else{
            this.timelineWindow.style.display = "none";
            this.mainScreen.appendChild(this.timelineHeader);
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
    }
}

export { UiTimeline };
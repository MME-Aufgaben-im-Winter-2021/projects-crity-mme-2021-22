import { Listener } from "../../../../common/model/Observable.js";
import { ObservableArray } from "../../../../common/model/ObservableArray.js";
import { data } from "../../model/data.js";
import { UiTimelineVersion } from "./UiTimelineVersion.js";

class UiTimeline {
    constructor(screen) {
        this.el = screen.el.querySelector(".id-version-list");

        this.addVersionButtonEl = screen.el.querySelector(".id-add-version-button");
        this.addVersionButtonEl.addEventListener("click", () => this.onAddButtonClicked());

        // Hidden file input element, we only use this to open a file dialog box.
        this.fileInputEl = screen.el.querySelector(".id-file-input");
        this.fileInputEl.addEventListener("change", () => this.onFileSelectorConcluded());

        this.listener = new Listener();
        data.versions.addEventListener(ObservableArray.EVENT_ITEM_ADDED, e => this.onVersionAdded(e), this.listener);
    }

    terminate() {
        this.listener.terminate();
    }

    onVersionAdded(e) {
        let version = e.data.item,
            uiVersion = new UiTimelineVersion(version);
        this.el.insertBefore(uiVersion.el, this.addVersionButtonEl);
    }

    onAddButtonClicked() {
        // Open a file dialog.
        this.fileInputEl.click();
    }

    onFileSelectorConcluded() {
        data.createPresentationVersion(data.presentationId, "V"+(data.versions.items.length+1), this.fileInputEl.files[0]);
    }
}

export { UiTimeline };
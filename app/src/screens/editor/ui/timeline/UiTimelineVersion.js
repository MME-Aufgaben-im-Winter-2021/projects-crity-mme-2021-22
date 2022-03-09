import { Listener } from "../../../../common/model/Observable.js";
import { cloneDomTemplate, ensureCssClassPresentIff } from "../../../../common/ui/dom-utils.js";
import { data, EditorData } from "../../model/data.js";

// An item in the timeline, representing a version of the presentation.
class UiTimelineVersion {
    constructor(version) {
        this.el = cloneDomTemplate("#version-template");

        this.labelEl = this.el.querySelector(".label");
        this.labelEl.textContent = version.label;

        this.el.addEventListener("click", () => this.onClick());

        this.version = version;
        this.updateSelectionState();

        this.listener = new Listener();
        data.addEventListener(EditorData.EVENT_ACTIVE_VERSION_CHANGED, () => this.updateSelectionState(), this.listener);
    }

    terminate() {
        this.listener.terminate();
    }

    onClick() {
        data.setVersion(this.version);
    }
    
    // TODO(optimize): This is called for every version item, in theory we only need to call this twice.
    updateSelectionState() {
        let isSelected = (data.activeVersion === this.version);
        ensureCssClassPresentIff(isSelected, "selected", this.el);
    }
}

export { UiTimelineVersion };
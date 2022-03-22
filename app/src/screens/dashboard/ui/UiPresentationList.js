import { Listener } from "../../../common/model/Observable.js";
import { ObservableArray } from "../../../common/model/ObservableArray.js";
import { data } from "../model/data.js";
import { UiPresentationItem } from "./UiPresentationItem.js";

class UiPresentationList {
    constructor(screen) {
        this.screen = screen;
        this.el = this.screen.el.querySelector(".id-presentation-list");

        this.listener = new Listener();

        data.presentationList.presentations.addEventListener(ObservableArray.EVENT_ITEM_ADDED, e => this.onPresentationAdded(e), this.listener);
        data.presentationList.presentations.addEventListener(ObservableArray.EVENT_ITEM_REMOVED, e => this.onPresentationRemoved(e), this.listener);
    }

    terminate() {
        this.listener.terminate();
    }

    onPresentationAdded(e) {
        let presentationItem = new UiPresentationItem(this.screen, e.data.item, this);
    //    console.log(e.data.item); gibt die Präsentation zurück
    //    console.log(presentationItem); gibt das UI-Element zurück
        this.el.appendChild(presentationItem.el);
    }

    onPresentationRemoved(e) {
        console.log(e.data.item);
    }

    removePresentation(el) {
        this.el.removeChild(el);
    }
}

export { UiPresentationList };
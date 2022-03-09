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
    }

    terminate() {
        this.listener.terminate();
    }

    onPresentationAdded(e) {
        let presentationItem = new UiPresentationItem(this.screen, e.data.item);
        this.el.appendChild(presentationItem.el);
    }
}

export { UiPresentationList };
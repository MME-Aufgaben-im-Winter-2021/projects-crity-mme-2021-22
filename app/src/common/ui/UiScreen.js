import { Event, Observable } from "../model/Observable.js";
import { cloneDomTemplate } from "./dom-utils.js";

class UiScreen extends Observable {
    static EVENT_REQUEST_SCREEN_CHANGE = "REQUEST_SCREEN_CHANGE";

    constructor(templateSelector) {
        super();
        this.el = cloneDomTemplate(templateSelector);
    }

    // WARNING: This will call the terminate function! Best idea is to not do anything after
    // calling this!
    requestScreenChange(screen, screenParameters) {
        this.notifyAll(new Event(UiScreen.EVENT_REQUEST_SCREEN_CHANGE, {screen, screenParameters}));
    }

    static formatUrl(screen, screenParameters) {
        let urlSearchParams = new URLSearchParams(screenParameters);
        let paramsString = urlSearchParams.toString();

        if (paramsString.length > 0) {
            paramsString = "?" + paramsString;
        }

        return `${paramsString}#${screen}`;
    }
}

export { UiScreen };
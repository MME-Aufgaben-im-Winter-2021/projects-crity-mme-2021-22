
import { Listener } from "../../../../common/model/Observable.js";
import { data } from "../../model/data.js";
import { UiThumbnail } from "./UiThumbnail.js";

class UiThumbnailBar {
    constructor(screen) {
        this.el = screen.el.querySelector(".id-sidebar-left");

        this.listener = new Listener();
        this.uiThumbnails = [];
        this.createThumbnails();
    }

    terminate() {
        this.pClearUiThumbnails();
        this.listener.terminate();
    }

    // Responsible for creating all the little thumbnails.
    createThumbnails() {
        let numPages = data.selTracker.pdf.numPages;
        for (let i = 0; i < numPages; i++) {
            let uiThumbnail = new UiThumbnail(i + 1);

            this.uiThumbnails.push(uiThumbnail);
            this.el.appendChild(uiThumbnail.el);
        }
    }

    pClearUiThumbnails() {
        this.el.innerHTML = "";
        this.uiThumbnails.forEach(uiThumbnail => {
            uiThumbnail.terminate();
        });
        this.uiThumbnails.length = 0;
    }
}

export { UiThumbnailBar };

import { Listener } from "../../../../common/model/Observable.js";
import { data, EditorData } from "../../model/data.js";
import { UiThumbnail } from "./UiThumbnail.js";

class UiThumbnailBar {
    constructor(screen) {
        this.el = screen.el.querySelector(".id-sidebar-left");

        if (data.hasPdf()) {
            this.createThumbnails();
        }

        this.listener = new Listener();
        data.addEventListener(EditorData.EVENT_PDF_LOADED, () => this.createThumbnails(), this.listener);

        this.uiThumbnails = [];
    }

    terminate() {
        this.p_clearUiThumbnails();
        this.listener.terminate();
    }

    // Responsible for creating all the little thumbnails.
    // TODO: Remove old thumbnails once a new PDF is loaded?
    createThumbnails() {
        this.p_clearUiThumbnails();

        let numPages = data.activePdf.pdfJsPdf.numPages;
        for (let i = 0; i < numPages; i++) {
            let uiThumbnail = new UiThumbnail(i + 1);

            this.uiThumbnails.push(uiThumbnail);
            this.el.appendChild(uiThumbnail.el);
        }
    }

    p_clearUiThumbnails() {
        this.el.innerHTML = "";
        this.uiThumbnails.forEach(uiThumbnail => {
            uiThumbnail.terminate();
        });
        this.uiThumbnails.length = 0;
    }
}

export { UiThumbnailBar };
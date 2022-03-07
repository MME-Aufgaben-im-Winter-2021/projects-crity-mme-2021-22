import { assert } from "../common/utils.js";

var uiScreenRegistry;

class UiScreenRegistry {
    constructor() {
        this.screenClassesByName = [];
        this.activeScreenName = null;
    }

    add(screenClass) {
        assert(this.screenClassesByName[screenClass.NAME] === undefined);
        this.screenClassesByName[screenClass.NAME] = screenClass;
    }

    getClass(screenName) {
        return this.screenClassesByName[screenName];
    }

}

uiScreenRegistry = new UiScreenRegistry();
export { uiScreenRegistry };
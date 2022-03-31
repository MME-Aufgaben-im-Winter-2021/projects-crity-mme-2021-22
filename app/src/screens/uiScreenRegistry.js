import { assert } from "../common/utils.js";

var uiScreenRegistry;

// Keeps an index of all the screens that can be accessed, this allows us to keep per-screen data,
// which makes adding a new screen easier than having to look for all sorts of switch-cases that strewn
// through the codebase.

// To add a new screen:
// - Create a class that inherits UiScreen/UiRestrictedScreen (see there for how to do that).
// - In the same module, call UiScreenRegistry.add(ScreenClass), where ScreenClass is the class name of your screen.
// - Import the module in import-screen.js

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
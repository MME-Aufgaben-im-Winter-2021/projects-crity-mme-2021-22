import { Observable, Event } from "./Observable.js";

// Array + Events.
// Following MVC tradition, we try to make the model notify everyone about changes using events,
// instead of having the people changing the data call the UI-related functions that deal with the changes.
// Since arrays are pretty common, we have a generic class, still a bit meager but hey we can add stuff as we
// go.
class ObservableArray extends Observable {
    static EVENT_ITEM_ADDED = "ITEM_ADDED";
    static EVENT_ITEM_REMOVED = "ITEM_REMOVED";
    static EVENT_CLEARED = "CLEARED";
    
    // TODO: Add those?
    //static EVENT_ITEM_REMOVED = "ITEM_REMOVED";
    //static EVENT_FULL_UPDATE = "FULL_UPDATE";

    constructor() {
        super();
        this.items = [];
    }

    push(item) {
        this.items.push(item);
        this.notifyAll(new Event(ObservableArray.EVENT_ITEM_ADDED, {item}));
    }

    remove(item) {
        this.items.splice(this.items.indexOf(item), 1);
        this.notifyAll(new Event(ObservableArray.EVENT_ITEM_REMOVED, {item}));
    }

    clear() {
        this.items.length = 0;
        this.notifyAll(new Event(ObservableArray.EVENT_CLEARED, {}));
    }

    getFirst() {
        if (this.items.length === 0) {
            return null;
        }

        return this.items[0];
    }

    getLast() {
        if (this.items.length === 0) {
            return null;
        }
        
        return this.items[this.items.length - 1];
    }

}

export {ObservableArray};
import { Observable, Event } from "./Observable.js";

// Array + Events.
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
/* eslint-env browser */

import { assert, generateId } from "../utils.js";

// Death-safe event handling. We try to handle dying listeners and observers. Observers inherit
// the Observable class, listeners instantiate the Listener class.
// This is necessary to avoid zombie-callbacks when a screen dies. However, the problem is not fully
// fixed since some people are still using async-await, which is pretty hard to control when it comes to
// corner-cases ....

class Event {
    constructor(type, data) {
        this.type = type;
        this.data = data;
        Object.freeze(this);
    }
}

class Subscription {
    constructor(listenerId, observableId, eventType, callback) {
        this.listenerId = listenerId;
        this.observableId = observableId;
        this.eventType = eventType;
        this.callback = callback;
    }
}

class GlobalSubscriptionTable {
    /////////////////////////////////////////////////////////////////////////////////////////////////
    // Static members.
    /////////////////////////////////////////////////////////////////////////////////////////////////

    // These are indexes, not indices!

    // (observableId, eventType) |-> Set(subscription references)
    static observableAndEventTypeIndex = {};
    // observableId |-> Set(subscription references)
    static observableIndex = {};
    // listenerId |-> Set(subscription references)
    static listenerIndex = {};

    /////////////////////////////////////////////////////////////////////////////////////////////////
    // Entry creation/removal
    /////////////////////////////////////////////////////////////////////////////////////////////////

    static addSubscription(subscription) {
        assert(!subscription.eventType.includes(","));

        GlobalSubscriptionTable.pForEachIndex(subscription, (index, key) => {
            if (index[key] === undefined) {
                index[key] = new Set();
            }

            index[key].add(subscription);
        });
    }

    static removeSubscription(subscription) {
        GlobalSubscriptionTable.pForEachIndex(subscription, (index, key) => {
            if (index[key] !== undefined) {
                index[key].delete(subscription);
                if (index[key].size === 0) {
                    delete index[key];
                }
            }

        });
    }

    static removeSubscriptions(subscriptions) {
        subscriptions.forEach(subscription => GlobalSubscriptionTable.removeSubscription(subscription));
    }

    static pForEachIndex(subscription, doWhat) {
        doWhat(GlobalSubscriptionTable.observableAndEventTypeIndex, `${subscription.observableId},${subscription.eventType}`);
        doWhat(GlobalSubscriptionTable.observableIndex, `${subscription.observableId}`);
        doWhat(GlobalSubscriptionTable.listenerIndex, `${subscription.listenerId}`);
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////
    // Query
    /////////////////////////////////////////////////////////////////////////////////////////////////

    /// @return Set.
    static querySubscriptionsByObservableAndEventType(observableId, eventType) {
        return GlobalSubscriptionTable.pQueryIndex(GlobalSubscriptionTable.observableAndEventTypeIndex, `${observableId},${eventType}`);
    }

    /// @return Set.
    static querySubscriptionsByObservable(observableId) {
        return GlobalSubscriptionTable.pQueryIndex(GlobalSubscriptionTable.observableIndex, `${observableId}`);
    }

    /// @return Set.
    static querySubscriptionsByListener(listenerId) {
        return GlobalSubscriptionTable.pQueryIndex(GlobalSubscriptionTable.listenerIndex, `${listenerId}`);
    }
    
    /// @return Set.
    static pQueryIndex(index, key) {
        let result = index[key];
        if (result === undefined) {
            result = new Set();
        }
        return result;
    }
}

// Whenever your class wants to subscribe to events, create one instance (once is enough for multiple event types and
// for multiple observers).
// Call listener.terminate() when terminating your class.
class Listener {
    constructor() {
        this.listenerId = generateId();
    }

    // Call this to 
    // (1) Save memory from the table entries. 
    // (2) Avoid zombie-callbacks when a listener gets terminated but the observable remains alive.
    // (3) If you forget to call this and the observable remains alive, the listener will *not* be garbage-collected.
    //     This is because the callback closure still keeps a reference to the listener.
    terminate() {
        let subscriptions = GlobalSubscriptionTable.querySubscriptionsByListener(this.listenerId);
        GlobalSubscriptionTable.removeSubscriptions(subscriptions);
    }
}

// Inherit this to be able to emit events.
class Observable {
    constructor() {
        // Intentionally not calling this id, to avoid naming collisions farther down
        // the class hierarchy.
        this.observableId = generateId();
    }

    // Call this to save memory from the table entries. But if you forget to call terminate(), the observable itself will still get
    // garbage-collected (even when listeners remain alive) since the subscriptions only store IDs, not references.
    terminate() {
        this.clearEventListeners();
    }

    // Subscribe to eventType.
    addEventListener(eventType, callback, listener) {
        let subscription = new Subscription(listener.listenerId, this.observableId, eventType, callback);
        GlobalSubscriptionTable.addSubscription(subscription);
    }

    clearEventListeners() {
        let subscriptions = GlobalSubscriptionTable.querySubscriptionsByObservable(this.observableId);
        GlobalSubscriptionTable.removeSubscriptions(subscriptions);
    }

    // Emit an event.
    notifyAll(event) {
        let subscriptions = GlobalSubscriptionTable.querySubscriptionsByObservableAndEventType(this.observableId, event.type);
        subscriptions.forEach(subscription => {
            subscription.callback(event);
        });
    }
}

export { Event, Observable, Listener };
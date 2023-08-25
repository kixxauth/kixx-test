export default class EventEmitter {

    constructor() {
        Object.defineProperties(this, {
            listenersByEventName: {
                value: new Map(),
            },
            onceListenersByEventName: {
                value: new Map(),
            },
        });
    }

    on(eventName, listener) {
        let listeners = this.listenersByEventName.get(eventName);

        if (!listeners) {
            listeners = new Set();
            this.listenersByEventName.set(eventName, listeners);
        }

        listeners.add(listener);
    }

    off(eventName, listener) {
        if (arguments.length === 0) {
            this.listenersByEventName.clear();
            this.onceListenersByEventName.clear();
        } else if (arguments.length === 1) {
            const listeners = this.listenersByEventName.get(eventName);

            if (listeners) {
                this.listenersByEventName.delete(eventName);
                listeners.clear();
            }

            const onceListeners = this.onceListenersByEventName.get(eventName);

            if (onceListeners) {
                this.onceListenersByEventName.delete(eventName);
                onceListeners.clear();
            }
        } else {
            const listeners = this.listenersByEventName.get(eventName);

            if (listeners) {
                listeners.delete(listener);

                if (listeners.size === 0) {
                    this.listenersByEventName.delete(eventName);
                }
            }

            const onceListeners = this.onceListenersByEventName.get(eventName);

            if (onceListeners) {
                onceListeners.delete(listener);

                if (onceListeners.size === 0) {
                    this.onceListenersByEventName.delete(eventName);
                }
            }
        }
    }

    once(eventName, listener) {
        let listeners = this.onceListenersByEventName.get(eventName);

        if (!listeners) {
            listeners = new Set();
            this.onceListenersByEventName.set(eventName, listeners);
        }

        listeners.add(listener);
    }

    emit(eventName, event) {
        const onceListeners = this.onceListenersByEventName.get(eventName);
        const listeners = this.listenersByEventName.get(eventName);

        if (onceListeners) {
            for (const fn of onceListeners.values()) {
                onceListeners.delete(fn);
                fn(event);
            }
        }

        if (listeners) {
            for (const fn of listeners.values()) {
                fn(event);
            }
        }
    }
}

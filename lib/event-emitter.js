export default class EventEmitter {

    #handlers = new Map();

    /**
     * Register an event handler
     * @param {string} eventName - The name of the event to listen for
     * @param {Function} handler - The function to call when the event occurs
     */
    on(eventName, handler) {
        if (typeof eventName !== 'string') {
            throw new Error('Event name must be a string');
        }
        if (typeof handler !== 'function') {
            throw new Error('Handler must be a function');
        }

        if (!this.#handlers.has(eventName)) {
            this.#handlers.set(eventName, []);
        }

        this.#handlers.get(eventName).push(handler);
    }

    /**
     * Remove an event handler
     * @param {string} eventName - The name of the event
     * @param {Function} handler - The handler function to remove
     */
    off(eventName, handler) {
        if (typeof eventName !== 'string') {
            throw new Error('Event name must be a string');
        }
        if (typeof handler !== 'function') {
            throw new Error('Handler must be a function');
        }

        const handlers = this.#handlers.get(eventName);
        if (handlers) {
            // Remove all instances of the handler
            const newHandlers = handlers.filter((h) => h !== handler);
            if (newHandlers.length === 0) {
                this.#handlers.delete(eventName);
            } else {
                this.#handlers.set(eventName, newHandlers);
            }
        }
    }

    /**
     * Emit an event to all registered handlers
     * @param {string} eventName - The name of the event to emit
     * @param {*} event - The event data to pass to handlers
     */
    emit(eventName, event) {
        if (typeof eventName !== 'string') {
            throw new Error('Event name must be a string');
        }

        const handlers = this.#handlers.get(eventName);
        if (handlers) {
            for (const handler of handlers) {
                try {
                    handler(event);
                } catch (error) {
                    // If there's an error in a handler, emit it as an 'error' event
                    // but don't re-throw to allow other handlers to run
                    this.emit('error', error);
                }
            }
        }
    }
}

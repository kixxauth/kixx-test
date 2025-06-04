import { DEFAULT_TIMEOUT } from './constants.js';

export default class RunnableBlock {
    type = null;
    namePath = [];
    fn = null;
    disabled = false;
    timeout = DEFAULT_TIMEOUT;

    /**
     * Creates a new RunnableBlock instance
     * @param {Object} spec - The specification object
     * @param {string} spec.type - The type of the block. "test", "before", or "after"
     * @param {string[]} spec.namePath - Ancestor block names (strings), including name of this block
     * @param {Function} spec.fn - The function to run
     * @param {boolean} [spec.disabled] - Whether the block is disabled
     * @param {number} [spec.timeout] - Timeout in milliseconds
     */
    constructor(spec) {
        this.type = spec.type;
        this.namePath = spec.namePath;
        this.fn = spec.fn;

        if (spec.disabled) {
            this.disabled = true;
        }

        if (Number.isInteger(spec.timeout)) {
            this.timeout = spec.timeout;
        }
    }

    concatName(delimiter = ':') {
        return this.namePath.join(delimiter);
    }

    run(emitter, options = {}) {
        if (this.disabled) {
            return;
        }

        const block = this;
        const timeout = Number.isInteger(options.timeout) ? options.timeout : this.timeout;

        return new Promise((resolvePromise, rejectPromise) => {
            let resolved = false;

            const timeoutHandle = setTimeout(() => {
                reject(new Error(`timed out in ${ timeout }ms`));
            }, timeout);

            function resolve() {
                clearTimeout(timeoutHandle);
                if (resolved) {
                    const error = new Error('RunnableBlock resolved multiple times');
                    emitter.emit('multipleResolves', { block, error });
                } else {
                    resolved = true;
                    resolvePromise(true);
                }
            }

            function reject(error) {
                clearTimeout(timeoutHandle);
                if (resolved) {
                    emitter.emit('multipleRejections', { block, error });
                } else {
                    resolved = true;
                    rejectPromise(error);
                }
            }

            if (this.fn.length === 0) {
                // If the block function has zero parameters we assume it returns a
                // value synchronously or a promise.
                try {
                    Promise.resolve(this.fn()).then(resolve, reject);
                } catch (error) {
                    reject(error);
                }
            } else {
                // If the block function has more than 0 parameters then we assume
                // it is an asynchronous callback.
                try {
                    const res = this.fn((error) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve();
                        }
                    });

                    Promise.resolve(res).catch(reject);
                } catch (error) {
                    reject(error);
                }
            }
        });
    }
}

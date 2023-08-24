
export function createDescribeBlock() {

    return {

        before(fn, opts = {}) {
            if (!isFunction(fn)) {
                throw new ProgrammerError(
                    'First argument to before() must be a function',
                    null,
                    this.before
                );
            }

            opts = Object.assign({}, options, opts || {});

            const timeout = Number.isInteger(opts.timeout) ? opts.timeout : 3000;
            const blockRunner = createAsyncBlockRunner(emitter, 'before', fn, timeout);

            beforeBlocks.push(blockRunner);
        },

        after(fn, opts = {}) {
            if (!isFunction(fn)) {
                throw new ProgrammerError(
                    'First argument to after() must be a function',
                    null,
                    this.before
                );
            }

            opts = Object.assign({}, options, opts || {});

            const timeout = Number.isInteger(opts.timeout) ? opts.timeout : 3000;
            const blockRunner = createAsyncBlockRunner(emitter, 'after', fn, timeout);

            afterBlocks.push(blockRunner);
        },

        it() {
        },

        describe() {
        },

        xit() {
        },

        xdescribe() {
        },
    }
}

export function createAsyncBlockRunner(emitter, blockType, fn, timeout) {
    return function blockRunner() {
        return new Promise((resolve, reject) => {
            let resolved = false;

            const timeoutHandle = setTimeout(() => {
                resolved = true;

                let msg = `The ${ blockType}() block timed out in ${ timeout }ms`;
                msg += ' before the done() callback was called.';

                reject(new ProgrammerError(msg, null, fn));
            }, timeout);

            try {

                if (fn.length > 0) {
                    // If the block function accepts 1 or more parameters then
                    // we expect it to use a passed in callback.
                    fn((error, subject) => {
                        clearTimeout(timeoutHandle);

                        if (error && resolved) {
                            emitter.emit('unreportedError', { error, blockType });
                        } else if (error) {
                            reject(error);
                        } else {
                            resolve(subject);
                        }
                    });
                } else {
                    const res = fn();

                    Promise.resolve(res).then((subject) => {
                        clearTimeout(timeoutHandle);

                        if (!resolved) {
                            resolve(subject);
                        }
                    }, (error) => {
                        clearTimeout(timeoutHandle);

                        if (resolved) {
                            emitter.emit('unreportedError', { error, blockType });
                        } else {
                            reject(error);
                        }
                    });
                }
            } catch (error) {
                clearTimeout(timeoutHandle);
                reject(error);
            }
        });
    };
}

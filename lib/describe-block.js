/* globals setTimeout, clearTimeout */
import { ProgrammerError } from './errors.js';
import { isFunction, isNonEmptyString } from './utils.js';


export function createDescribeBlock(spec) {
    const {
        emitter,
        options,
        ancestorNames,
        blocks,
    } = spec;

    const {
        beforeBlocks,
        testBlocks,
        childBlocks,
        afterBlocks,
    } = blocks;

    return {

        before(fn, blockOptions = {}) {
            if (!isFunction(fn)) {
                throw new ProgrammerError(
                    'First argument to before() must be a function',
                    null,
                    this.before
                );
            }

            const blockType = 'before';

            const block = {
                blockType,
                fn,
                name: blockType,
                ancestorNames,
                options: Object.assign({}, options, blockOptions || {}),
            };

            const emit = (eventName, payload) => {
                const event = Object.assign({}, block, payload);
                emitter.emit(eventName, event);
            };

            block.blockRunner = createAsyncBlockRunner(emit, block);

            beforeBlocks.push(block);
        },

        after(fn, blockOptions = {}) {
            if (!isFunction(fn)) {
                throw new ProgrammerError(
                    'First argument to after() must be a function',
                    null,
                    this.after
                );
            }

            const blockType = 'after';

            const block = {
                blockType,
                fn,
                name: blockType,
                ancestorNames,
                options: Object.assign({}, options, blockOptions || {}),
            };

            const emit = (eventName, payload) => {
                const event = Object.assign({}, block, payload);
                emitter.emit(eventName, event);
            };

            block.blockRunner = createAsyncBlockRunner(emit, block);

            afterBlocks.push(block);
        },

        it(name, fn) {
            if (!isNonEmptyString(name)) {
                throw new ProgrammerError(
                    'First argument to it() must be a string',
                    null,
                    this.it
                );
            }

            // If only a name argument is given, this block is considered to be disabled.
            const isDisabled = arguments.length < 2;

            if (!isDisabled && !isFunction(fn)) {
                throw new ProgrammerError(
                    'Second argument to it() must be a function',
                    null,
                    this.it
                );
            }

            const blockType = isDisabled ? 'xtest' : 'test';
            const blockRunner = isDisabled ? null : fn;

            testBlocks.push({
                blockType,
                fn,
                name,
                ancestorNames,
                timeout: null,
                blockRunner,
            });
        },

        describe(name, fn, opts = {}) {
            if (!isNonEmptyString(name)) {
                throw new ProgrammerError(
                    'First argument to describe() must be a string',
                    null,
                    this.describe
                );
            }

            // If only a name argument is given, this block is considered to be disabled.
            const isDisabled = arguments.length < 2;

            if (!isDisabled && !isFunction(fn)) {
                throw new ProgrammerError(
                    'Second argument to describe() must be a function',
                    null,
                    this.describe
                );
            }

            const blockType = isDisabled ? 'xdescribe' : 'describe';

            const newAncestorNames = ancestorNames.slice();
            newAncestorNames.push(name);

            const newBlocks = {
                beforeBlocks: [],
                testBlocks: [],
                childBlocks: [],
                afterBlocks: [],
            };

            const newDescribeBlock = createDescribeBlock({
                emitter,
                options: Object.assign({}, options, opts || {}),
                ancestorNames: newAncestorNames,
                blocks: newBlocks,
            });

            childBlocks.push({
                blockType,
                fn,
                name,
                ancestorNames,
                blocks: newBlocks,
            });

            if (!isDisabled) {
                fn(newDescribeBlock);
            }
        },

        xit(name) {
            if (!isNonEmptyString(name)) {
                throw new ProgrammerError(
                    'First argument to xit() must be a string',
                    null,
                    this.xit
                );
            }

            testBlocks.push({
                blockType: 'xtest',
                fn: null,
                name,
                ancestorNames,
                timeout: null,
                blockRunner: null,
            });
        },

        xdescribe(name) {
            if (!isNonEmptyString(name)) {
                throw new ProgrammerError(
                    'First argument to xdescribe() must be a string',
                    null,
                    this.xdescribe
                );
            }

            childBlocks.push({
                blockType: 'xdescribe',
                fn: null,
                name,
                ancestorNames,
                blocks: {
                    beforeBlocks: [],
                    testBlocks: [],
                    childBlocks: [],
                    afterBlocks: [],
                },
            });
        },
    };
}

export function createAsyncBlockRunner(emit, block) {
    const { blockType, fn, options } = block;

    return function blockRunner() {
        const timeout = Number.isInteger(options.timeout) ? options.timeout : 3000;

        return new Promise((resolve, reject) => {
            let resolved = false;

            const timeoutHandle = setTimeout(() => {
                resolved = true;

                let msg = `The ${ blockType }() block timed out in ${ timeout }ms`;
                msg += ' before the done() callback was called.';

                reject(new ProgrammerError(msg, null, fn));
            }, timeout);

            let subject;

            try {

                if (fn.length > 0) {
                    // If the block function accepts 1 or more parameters then
                    // we expect it to use a passed in callback.
                    fn((error, subject) => {
                        clearTimeout(timeoutHandle);

                        if (error && resolved) {
                            emit('unreportedError', { error });
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
                            emit('unreportedError', { error });
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

import { ProgrammerError } from './lib/errors.js';
import EventEmitter from './lib/event-emitter.js';
import { createDescribeBlock } from './lib/describe-block.js';

import {
    isFunction,
    isNonEmptyString,
    readDirectoryEntries
} from './lib/utils.js';


const emitter = new EventEmitter();

let options = {
    timeout: 3000,
};

let rootBlocks = [];


export function on(...args) {
    emitter.on(...args);
}

export function once(...args) {
    emitter.once(...args);
}

export function off(...args) {
    emitter.off(...args);
}

export function clear() {
    options = {
        timeout: 3000,
    };

    rootBlocks = [];
}

export function describe(name, fn, opts = {}) {

    if (!isNonEmptyString(name)) {
        throw new ProgrammerError(
            'First argument to describe() must be a string',
            null,
            describe
        );
    }

    // If only a name argument is given, this block is considered to be disabled.
    const isDisabled = arguments.length < 2;

    if (!isDisabled && !isFunction(fn)) {
        throw new ProgrammerError(
            'Second argument to describe() must be a function',
            null,
            describe
        );
    }

    const blockType = isDisabled ? 'xdescribe' : 'describe';

    const newBlocks = {
        beforeBlocks: [],
        testBlocks: [],
        childBlocks: [],
        afterBlocks: [],
    };

    const newDescribeBlock = createDescribeBlock({
        emitter,
        // Update the global options.
        options: Object.assign({}, options, opts || {}),
        ancestorNames: [ name ],
        blocks: newBlocks,
    });

    rootBlocks.push({
        blockType,
        fn,
        name,
        ancestorNames: [],
        blocks: newBlocks,
    });

    if (!isDisabled) {
        fn(newDescribeBlock);
    }
}

export async function run(opts = {}) {
    Object.assign(options, opts || {});

    async function walkBlock(_block) {
        const {
            beforeBlocks,
            testBlocks,
            childBlocks,
            afterBlocks,
        } = _block.blocks;

        let subject;
        let failure;

        emitter.emit('describeBlockStart', { block: _block });

        for (const block of beforeBlocks) {
            if (failure) {
                break;
            }

            const start = Date.now();
            let error;

            try {
                if (isFunction(block.blockRunner)) {
                    subject = await block.blockRunner();
                }
            } catch (err) {
                error = err;
                failure = err;
            }

            const end = Date.now();
            emitter.emit('beforeBlockEnd', { block, start, end, error });
        }

        for (const block of testBlocks) {
            if (failure) {
                break;
            }

            let error;

            if (isFunction(block.fn)) {
                try {
                    block.fn(subject);
                } catch (err) {
                    error = err;
                }
            }

            emitter.emit('testBlockEnd', { block, error });
        }

        for (const block of childBlocks) {
            await walkBlock(block);
        }

        for (const block of afterBlocks) {
            const start = Date.now();
            let error;

            if (isFunction(block.blockRunner)) {
                try {
                    await block.blockRunner();
                } catch (err) {
                    error = err;
                }
            }

            const end = Date.now();
            emitter.emit('afterBlockEnd', { block, start, end, error });
        }
    }

    // Uncomment to inspect:
    // console.log(JSON.stringify(rootBlocks[0], null, 2));

    for (const block of rootBlocks) {
        await walkBlock(block);
    }
}

export function loadFromFiles(url, matchPattern = /test.js$/) {

    async function walkDirectoryLevel(directoryUrl) {
        const entries = await readDirectoryEntries(directoryUrl);

        const files = [];
        const directories = [];

        for (const pathObject of entries) {
            if (pathObject.isDirectory) {
                directories.push(pathObject.url);
            }
            if (pathObject.isFile && matchPattern.test(pathObject.url.pathname)) {
                files.push(pathObject.url);
            }
        }

        for (const dirUrl of directories) {
            await walkDirectoryLevel(dirUrl);
        }

        for (const fileUrl of files) {
            await import(fileUrl);
        }
    }

    return walkDirectoryLevel(url);
}

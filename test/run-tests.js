import process from 'node:process';
import fsp from 'node:fs/promises';
import { runTests } from '../mod.js';

import { EOL } from 'node:os';

const RED = `\x1b[31m`;
const GREEN = `\x1b[32m`;
const YELLOW = `\x1b[33m`;
const COLOR_RESET = `\x1b[0m`;

const MAX_STACK_LENGTH = 4;


async function main() {
    const directory = new URL('./', import.meta.url);
    const pattern = /test.js$/;

    let errorCount = 0;

    await loadTestFilesFromDirectory(directory, pattern);

    const emitter = runTests();

    emitter.on('error', (error) => {
        // eslint-disable-next-line no-console
        console.error('Error event while running tests:');
        // eslint-disable-next-line no-console
        console.error(error);

        setTimeout(() => {
            process.exit(1);
        }, 500);
    });

    emitter.on('complete', () => {
        let exitCode = 0;

        const prefix = 'Test run is complete ';

        let message;
        if (errorCount > 0) {
            exitCode = 1;
            message = `${ RED }${ prefix }with ${ errorCount } errors${ COLOR_RESET }`;
        } else {
            message = `${ GREEN }${ prefix }with no errors${ COLOR_RESET }`;
        }

        message += EOL;

        write(message, () => {
            process.exit(exitCode);
        });
    });

    emitter.on('multipleResolves', ({ block }) => {
        errorCount += 1;
        write(`${ RED }Error: Block [${ block.concatName('#') }] had multiple resolves${ COLOR_RESET }${ EOL }`);
    });

    emitter.on('multipleRejections', ({ block, error }) => {
        errorCount += 1;
        write(`${ RED }Error: Block [${ block.concatName('#') }] had multiple rejections${ COLOR_RESET }${ EOL }`);
        if (error) {
            const stack = error.stack.split(EOL).map((line) => line.trimEnd()).slice(0, MAX_STACK_LENGTH);
            for (const line of stack) {
                write(line + EOL);
            }
        }
    });

    emitter.on('blockComplete', ({ block, start, end, error }) => {
        if (block.disabled) {
            write(`${ YELLOW }Block [${ block.concatName('#') }] disabled${ COLOR_RESET }${ EOL }`);
            return;
        }

        let timeDelta = '';
        if ((end - start) > 1) {
            timeDelta = ` (${ end - start }ms)`;
        }

        const prefix = `Block [${ block.concatName('#') }] completed${ timeDelta }`;

        if (error) {
            errorCount += 1;
            write(`${ RED }${ prefix } with errors:${ COLOR_RESET }${ EOL }`);
            const stack = error.stack.split(EOL).map((line) => line.trimEnd()).slice(0, MAX_STACK_LENGTH);
            for (const line of stack) {
                write(line + EOL);
            }
        } else {
            write(`${ GREEN }${ prefix } with no errors:${ COLOR_RESET }${ EOL }`);
        }
    });
}

async function loadTestFilesFromDirectory(directory, pattern) {
    let promises;

    const testFiles = await readTestFiles(directory, pattern);
    promises = testFiles.map(dynamicallyImportFile);
    await Promise.all(promises);

    const subDirectories = await readSubDirectories(directory);
    promises = subDirectories.map((pathname) => {
        return loadTestFilesFromDirectory(pathname, pattern);
    });
    await Promise.all(promises);
}

async function readTestFiles(directory, pattern) {
    const files = await readDirectory(directory);

    return files.filter(({ url, stats }) => {
        return stats.isFile() && pattern.test(url.href);
    });
}

async function readSubDirectories(parentDirectory) {
    const files = await readDirectory(parentDirectory);

    return files.filter(({ stats }) => {
        return stats.isDirectory();
    });
}

async function dynamicallyImportFile(file) {
    const { url } = file;
    await import(url);
}

async function readDirectory(url) {
    const entries = await fsp.readdir(url);

    const promises = entries.map((entry) => {
        const fullpath = new URL(entry, url);
        return fsp.stat(fullpath).then((stats) => {
            return { stats, url: new URL(`${ url.href }/`) };
        });
    });

    return Promise.all(promises);
}

function write(msg, callback) {
    process.stdout.write(msg, callback);
}

main().catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Error running tests:');
    // eslint-disable-next-line no-console
    console.error(error);

    setTimeout(() => {
        process.exit(1);
    }, 500);
});

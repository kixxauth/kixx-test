/* globals console, URL */
import { loadFromFiles, run, on } from '../mod.js';

const RED = `\x1b[31m`;
const GREEN = `\x1b[32m`;
const YELLOW = `\x1b[33m`;
const COLOR_RESET = `\x1b[0m`;

const url = new URL('./', import.meta.url);

let testCount = 0;
const failures = [];
const disabledBlocks = [];
const disabledTests = [];


async function main() {
    await loadFromFiles(url);
    await run();
}

on('unreportedError', (ev) => {
    // Uncomment to inspect:
    // console.log('event:unreportedError', ev);
    failures.push(ev);
});

on('describeBlockStart', (ev) => {
    // Uncomment to inspect:
    // console.log('event:describeBlockStart', ev);
    if (ev.block.isDisabled) {
        disabledBlocks.push(ev);
    }
});

on('beforeBlockEnd', (ev) => {
    // Uncomment to inspect:
    // console.log('event:beforeBlockEnd', ev);
    if (ev.error) {
        failures.push(ev);
    }
});

on('testBlockEnd', (ev) => {
    // Uncomment to inspect:
    // console.log('event:testBlockEnd', ev);
    testCount += 1;

    if (ev.error) {
        failures.push(ev);
    }

    if (ev.block.isDisabled) {
        disabledTests.push(ev);
    }
});

on('afterBlockEnd', (ev) => {
    // Uncomment to inspect:
    // console.log('event:afterBlockEnd', ev);
    if (ev.error) {
        failures.push(ev);
    }
});

/* eslint-disable no-console */
main()
    .then(() => {
        if (disabledBlocks.length > 0) {
            console.error(`${ YELLOW }Disabled describe blocks:${ COLOR_RESET }`);
            for (const { block } of disabledBlocks) {
                let label = block.ancestorNames.join(' => ');
                label += ` => ${ block.name }`;

                console.log(`${ YELLOW } - ${ label }${ COLOR_RESET }`);
            }
            console.log('');
        }

        if (disabledTests.length > 0) {
            console.error(`${ YELLOW }Disabled Tests:${ COLOR_RESET }`);
            for (const { block } of disabledTests) {
                let label = block.ancestorNames.join(' => ');
                label += ` it ${ block.name }`;

                console.log(`${ YELLOW } - ${ label }${ COLOR_RESET }`);
            }
            console.log('');
        }

        for (const { block, error } of failures) {
            let label = block.ancestorNames.join(' => ');

            if (block.blockType === 'before') {
                label += ' => before()';
            } else if (block.blockType === 'after') {
                label += ' => after()';
            } else {
                label += ` it ${ block.name }`;
            }

            console.error(`${ RED }Failure:${ COLOR_RESET }`);
            console.error(RED + label + COLOR_RESET);
            console.error(error);
            console.error('');
        }

        console.log('Testing complete.');
        console.log('');
        console.log(' - Total test count     :', testCount);
        console.log(' - Disabled block count :', disabledBlocks.length);
        console.log(' - Disabled test count  :', disabledTests.length);
        console.log(' - Failed test count    :', failures.length);
        console.log('');

        if (failures.length > 0) {
            console.error(RED + 'Tests FAILED' + COLOR_RESET);
        } else {
            console.log(GREEN + 'Tests PASSED' + COLOR_RESET);
        }

        // TODO: Exit with proper exit code
    })
    .catch((err) => {
        console.error(RED + 'Caught testing error:' + COLOR_RESET);
        console.error(err);
        // TODO: Exit with proper exit code
    });
/* eslint-enable no-console */

/* globals console, URL */
import { loadFromFiles, run } from '../mod.js';

const url = new URL('./', import.meta.url);

async function main() {
    await loadFromFiles(url);
    await run();
}

/* eslint-disable no-console */
main()
    .then(() => {
        console.log('Testing complete.');
    })
    .catch((err) => {
        console.error('Caught testing error:');
        console.error(err);
    });
/* eslint-enable no-console */

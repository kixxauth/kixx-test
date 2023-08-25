/* globals Deno, URL */
import fsp from 'node:fs/promises';


const protoToString = Object.prototype.toString;
const isDeno = typeof Deno !== 'undefined';


export function isString(x) {
    // This expression will not catch strings created with new String('foo'):
    // return typeof x === 'string';
    return protoToString.call(x) === '[object String]';
}

export function isNonEmptyString(x) {
    return Boolean(x && isString(x));
}

export function isFunction(x) {
    return typeof x === 'function';
}

export async function readDirectoryEntries(url) {
    let results;

    if (isDeno) {
        results = await readDirectoryEntriesDeno(url);
    } else {
        results = await readDirectoryEntriesNode(url);
    }

    return results;
}

async function readDirectoryEntriesDeno(url) {
    const results = [];

    for await (const entry of Deno.readDir(url)) {
        if (entry.isFile) {
            results.push({
                isFile: true,
                url: new URL(entry.name, url),
            });
        }
        if (entry.isDirectory) {
            results.push({
                isDirectory: true,
                url: new URL(entry.name + '/', url),
            });
        }
    }

    return results;
}

async function readDirectoryEntriesNode(url) {
    const results = [];
    const entries = await fsp.readdir(url);

    for (const entry of entries) {
        const fileUrl = new URL(entry, url);
        const stat = await fsp.stat(fileUrl);

        if (stat.isFile()) {
            results.push({
                isFile: true,
                url: fileUrl,
            });
        }

        if (stat.isDirectory()) {
            fileUrl.pathname += '/';
            results.push({
                isDirectory: true,
                url: fileUrl,
            });
        }
    }

    return results;
}

import Path from 'path';
import fs
    from 'fs';

/**
 * Converts the path separators in a path to match the path separator of the current platform.
 * This allows tests to work cross-platform with minimal overhead.
 *
 * @param path Path to convert
 * @returns {@link path} with all path separators converted to the system path separator.
 */
export function fixSep(path: string): string {
    return path.replace(/[/\\]/g, Path.sep);
}

export function getTestDataPath(offsetPath?: string): string {
    // tests run from compiled root /dist, but the test data is not compiled and exists in /src
    if (offsetPath !== undefined) {
        return Path.resolve(__dirname, fixSep('../../../src/test/_data'), fixSep(offsetPath));
    } else {
        return Path.resolve(__dirname, fixSep('../../../src/test/_data'));
    }
}

export function getSandboxPath(offsetPath?: string): string {
    if (offsetPath !== undefined) {
        return Path.resolve(__dirname, fixSep('../_data'), fixSep(offsetPath));
    } else {
        return Path.resolve(__dirname, fixSep('../_data'));
    }
}

/**
 * Safely prepare the sandbox directory for test usage.
 * This function will clear and create the sandbox, then execute callback() to run the test.
 * When finished, it will erase the sandbox.
 * IMPORTANT: This MUST be called from a serial test (test.serial()) to avoid race conditions.
 *
 * @param callback Callback that will be executed when sandbox is ready
 */
export function useSandboxDirectory(callback: () => void): void {
    // get path to sandbox
    const localTestDataPath = getSandboxPath('./');

    try {
        // clean sandbox if it already exists
        if (fs.existsSync(localTestDataPath)) {
            fs.rmdirSync(localTestDataPath, { recursive: true });
        }
        fs.mkdirSync(localTestDataPath);

        // execute test
        callback();
    } finally {
        // remove sandbox is if it still exists
        if (fs.existsSync(localTestDataPath)) {
            fs.rmdirSync(localTestDataPath, { recursive: true });
        }
    }
}
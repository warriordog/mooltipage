import {join, resolve} from 'path';
import fs
    from 'fs';
import {fixPathSeparators} from '../../lib/fs/pathUtils';

export async function exists(path: string): Promise<boolean> {
    try {
        await fs.promises.stat(path);
        return true;
    } catch (_) {
        return false;
    }
}

async function requireDir(path: string): Promise<void> {
    try {
        // If path exists and is already a directory, then do nothing.
        const stats = await fs.promises.stat(path);
        if (stats.isDirectory()) {
            return;
        }
    } catch (_) {
        // If we get here, then it either doesn't exist or is not a directory
    }

    // Delete path if it exists
    await fs.promises.rm(path, { recursive: true, force: true });

    // Create directory
    await fs.promises.mkdir(path, { recursive: true });
}

/**
 * Recursively copy a directory subtree
 * @param relativePath
 * @param inputRoot
 * @param outputRoot
 */
async function recursivelyCopy(relativePath: string, inputRoot: string, outputRoot: string): Promise<void> {
    const inputNext = join(inputRoot, relativePath);
    const outputNext = join(outputRoot, relativePath);

    const stats = await fs.promises.stat(inputNext);
    if (stats.isDirectory()) {
        await requireDir(outputNext);
        for (const entry of (await fs.promises.readdir(inputNext))) {
            const entryNext = join(relativePath, entry);
            await recursivelyCopy(entryNext, inputRoot, outputRoot);
        }

    } else if (stats.isFile()) {
        await fs.promises.copyFile(inputNext, outputNext);

    } else {
        throw new Error(`Not copying test data file '${ relativePath }' - not a file or directory.`);
    }
}

/**
 * Copy test data to a sandbox directory.
 * The output root will be emptied and rebuilt matching the structure of the input.
 * @param outputRoot Absolute path to the location where the test data should be copied.
 * @param inputRoot Optional relative path to select a file or directory within the test data directory.
 */
export async function copyTestData(outputRoot: string, inputRoot = '.'): Promise<void> {
    // Normalize the inputs
    outputRoot = fixPathSeparators(outputRoot);
    inputRoot = getTestDataPath(inputRoot);

    // Create output directory
    await fs.promises.rm(outputRoot, { recursive: true, force: true });
    await fs.promises.mkdir(outputRoot, { recursive: true });

    // Copy the contents
    await recursivelyCopy('.', inputRoot, outputRoot);
}

export function getTestDataPath(offsetPath?: string): string {
    // tests run from compiled root /dist, but the test data is not compiled and exists in /src
    if (offsetPath !== undefined) {
        return resolve(__dirname, fixPathSeparators('../../../src/test/_data'), fixPathSeparators(offsetPath));
    } else {
        return resolve(__dirname, fixPathSeparators('../../../src/test/_data'));
    }
}

async function getRandomSandboxPath(): Promise<string> {
    let sandboxPath: string;

    do {
        const randomSuffix = String(100000 * Math.random());
        const sandboxName = join('..', '_temp', `sandbox${ randomSuffix }`);

        sandboxPath = resolve(__dirname, sandboxName);
    } while (await exists(sandboxPath));

    return sandboxPath;
}

/**
 * Create a random sandbox directory that can be used for a test case.
 * This function will create the sandbox, then execute callback() to run the test.
 * When finished, it will erase the sandbox.
 *
 * @param callback Callback that will be executed when sandbox is ready.
 */
export async function useSandboxDirectory(callback: (sandboxPath: string) => Promise<void>): Promise<void> {
    // create sandbox
    const sandboxPath = await getRandomSandboxPath();
    await fs.promises.mkdir(sandboxPath, { recursive: true });

    try {
        // execute test
        await callback(sandboxPath);

    } finally {
        // remove sandbox
        await fs.promises.rm(sandboxPath, { recursive: true, force: true});
    }
}
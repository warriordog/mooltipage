import Path
    from 'path';
import {
    getDirectoryContents,
    pathIsDirectory,
    pathIsFile,
    readFile,
} from '../lib/fs/fsUtils';

/**
 * Package.json file object
 */
export interface PackageJsonFile {
    /**
     * Package name.
     */
    name: string;

    /**
     * Package version.
     */
    version: string;

    [key: string]: unknown;
}

/**
 * Reads the package.json file at path and returns javascript object.
 * If path is not given, first package.json found in one of parent directories is used.
 *
 * @param path Optional path to package.json file
 * @returns PackageJsonFile Parsed data from package.json
 * @throws if path does not point to a file
 */
export async function readPackageJson(path?: string): Promise<PackageJsonFile> {
    if (path === undefined) {
        path = Path.resolve(__dirname, 'package.json');
        while (!await pathIsFile(path)) {
            path = Path.resolve(Path.dirname(path), '..', 'package.json');
        }
    }

    const packageJsonText = await readFile(path);
    return JSON.parse(packageJsonText);
}

/**
 * Scans a list of paths to extract all HTML files.
 * Paths can be any mix of files or directories.
 * Directories will be recursively searched.
 * Returned paths are all relative to basePath.
 *
 * @param paths List of paths to search
 * @param basePath Base path to compute relative paths
 * @returns Array of paths to all HTML files found in paths and subdirectories
 */
export async function expandPagePaths(paths: readonly string[], basePath: string): Promise<string[]> {
    const outPages: string[] = [];

    for (const rawPath of paths) {
        await expandPagePath(rawPath, basePath, outPages);
    }

    return outPages;
}

async function expandPagePath(pagePath: string, basePath: string, outPaths: string[]): Promise<void> {
    const realPath = Path.resolve(pagePath);

    // directories need to be recursively searched
    if (await pathIsDirectory(realPath)) {
        for (const subFile of (await getDirectoryContents(realPath))) {
            const subFilePath = Path.join(pagePath, subFile);

            // recurse with each directory content
           await expandPagePath(subFilePath, basePath, outPaths);
        }
    }

    // Add all HTML files
    if ((await pathIsFile(realPath)) && realPath.toLowerCase().endsWith('.html')) {
        // computer and save relative path
        const relativePath = Path.relative(basePath, pagePath);
        outPaths.push(relativePath);
    }
}

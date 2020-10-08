import Path
    from 'path';
import {
    getDirectoryContents,
    pathIsDirectory,
    pathIsFile,
    readFile
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
export function readPackageJson(path?: string): PackageJsonFile {
    if (path === undefined) {
        path = Path.resolve(__dirname, 'package.json');
        while (!pathIsFile(path)) {
            path = Path.resolve(Path.dirname(path), '..', 'package.json');
        }
    }

    const packageJsonText = readFile(path);
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
export function expandPagePaths(paths: string[], basePath: string): string[] {
    const outPages: string[] = [];

    for (const rawPath of paths) {
        expandPagePath(rawPath, basePath, outPages);
    }

    return outPages;
}

function expandPagePath(pagePath: string, basePath: string, outPaths: string[]): void {
    const realPath = Path.resolve(pagePath);

    // directories need to be recursively searched
    if (pathIsDirectory(realPath)) {
        for (const subFile of getDirectoryContents(realPath)) {
            const subFilePath = Path.join(pagePath, subFile);

            // recurse with each directory content
            expandPagePath(subFilePath, basePath, outPaths);
        }
    }

    // Add all HTML files
    if (pathIsFile(realPath) && realPath.toLowerCase().endsWith('.html')) {
        // computer and save relative path
        const relativePath = Path.relative(basePath, pagePath);
        outPaths.push(relativePath);
    }
}

import fs from 'fs';
import Path from 'path';

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
 * Check if a path exists and is a file
 * @param path Path to check
 * @returns True if path points to file, false otherwise
 */
export function pathIsFile(path: string): boolean {
    return fs.existsSync(path) && fs.statSync(path).isFile();
}

/**
 * Check if a directory exists and is a file
 * @param path Path to check
 * @returns True if path points to directory, false otherwise
 */
export function pathIsDirectory(path: string): boolean {
    return fs.existsSync(path) && fs.statSync(path).isDirectory();
}

/**
 * List the files in a directory.
 * Throws an exception if path is not a directory.
 * 
 * @param path Path to directory
 * @returns Returns an array of filenames of all files in a directory
 * @throws if path does not point to a directory
 */
export function getDirectoryContents(path: string): string[] {
    if (pathIsDirectory(path)) {
        return fs.readdirSync(path);
    } else {
        throw new Error(`Attempting to list files in directory that does not exist or is not a directory: "${ path }"`);
    }
}

/**
 * Reads the contents of a file as a UTF-8 string.
 * Throws an exception if path is not a file.
 * 
 * @param path Path to file
 * @returns Contents of file as a string
 * @throws if path does not point to a file
 */
export function readFile(path: string): string {
    if (pathIsFile(path)) {
        return fs.readFileSync(path, 'utf-8');
    } else {
        throw new Error(`Attempting to read file that does not exist or is not a file: "${ path }"`);
    }
}

/**
 * Reads the package.json file at path and returns javascript object.
 * If path is not given, first package.json found in one of parent directories is used.
 *
 * @param path Optional path to package.json file
 * @returns [[PackageJsonFile]] object
 * @throws if path does not point to a file
 */
export function readPackageJson(path?: string): PackageJsonFile {
  if (path == null) {
    path = Path.resolve(__dirname, 'package.json');
    while (!pathIsFile(path)) {
      path = Path.resolve(Path.dirname(path), '..', 'package.json');
    }
  }
  return JSON.parse(readFile(path)) as PackageJsonFile;
}

/**
 * Writes a file as UTF-8.
 * Throws an exception if path is not a file.
 * 
 * @param path Path to file
 * @param content File contents
 * @param createPaths If true, directory tree will be created up to the file
 */
export function writeFile(path: string, content: string, createPaths?: boolean): void {
    if (createPaths) {
        const directory: string = Path.dirname(path);
        fs.mkdirSync(directory, { recursive: true });
    }

    return fs.writeFileSync(path, content, 'utf-8');
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

    // HTML are added directly
    if (pathIsFile(realPath) && realPath.toLowerCase().endsWith('.html')) {
        const relativePath = Path.relative(basePath, pagePath);
        outPaths.push(relativePath);
    }

    // other file types (such as links) are currently skipped
} 

import fs from 'fs';
import Path from 'path';

/**
 * Check if a path exists and is a file
 * @deprecated use {@link pathIsFile}
 * @param path Path to check
 * @returns True if path points to file, false otherwise
 */
export function pathIsFileSync(path: string): boolean {
    return fs.existsSync(path) && fs.statSync(path).isFile();
}

/**
 * Check if a path exists and is a file
 * @param path Path to check
 * @returns True if path points to file, false otherwise
 */
export async function pathIsFile(path: string): Promise<boolean> {
    try {
        return (await fs.promises.stat(path)).isFile();
    } catch {
        return false;
    }
}

/**
 * Check if a directory exists and is a file
 * @param path Path to check
 * @returns True if path points to directory, false otherwise
 */
export async function pathIsDirectory(path: string): Promise<boolean> {
    try {
        return (await fs.promises.stat(path)).isDirectory();
    } catch {
        return false;
    }
}

/**
 * List the files in a directory.
 * Throws an exception if path is not a directory.
 *
 * @param path Path to directory
 * @returns Returns an array of filenames of all files in a directory
 * @throws Throws if path does not point to a directory or if an IO error occurs
 */
export async function getDirectoryContents(path: string): Promise<string[]> {
    if (!(await pathIsDirectory(path))) {
        throw new Error(`Attempting to list files in directory that does not exist or is not a directory: "${ path }"`);
    }
    
    return fs.promises.readdir(path);
}

/**
 * Reads the contents of a file as a UTF-8 string.
 * Throws an exception if path is not a file.
 * @deprecated use {@link readFile}
 * 
 * @param path Path to file
 * @returns Contents of file as a string
 * @throws if path does not point to a file
 */
export function readFileSync(path: string): string {
    if (pathIsFileSync(path)) {
        return fs.readFileSync(path, 'utf-8');
    } else {
        throw new Error(`Attempting to read file that does not exist or is not a file: "${ path }"`);
    }
}
    /**
     * Reads the contents of a file as a string.
     * Throws an exception if path is not a file.
     *
     * @param path Path to file
     * @param encoding File encoding. Defaults to UTF 8.
     * @returns Contents of file as a string
     * @throws Throws if path does not point to a file
     */
export async function readFile(path: string, encoding: BufferEncoding = 'utf-8'): Promise<string> {
    if (!(await pathIsFile(path))) {
        throw new Error(`Attempting to read file that does not exist or is not a file: "${ path }"`);
    }
    
    return fs.promises.readFile(path, encoding);
}

/**
 * Writes a file as UTF-8.
 * Throws an exception if path is not a file.
 * @deprecated use {@link writeFile}
 * 
 * @param path Path to file
 * @param content File contents
 * @param createPaths If true, directory tree will be created up to the file
 */
export function writeFileSync(path: string, content: string, createPaths?: boolean): void {
    if (createPaths) {
        const directory: string = Path.dirname(path);
        fs.mkdirSync(directory, { recursive: true });
    }

    return fs.writeFileSync(path, content, 'utf-8');
}

/**
 * Writes a file as UTF-8.
 * Throws an exception if path is not a file.
 *
 * @param path Path to file
 * @param content File contents
 * @param createPaths If true, directory tree will be created up to the file
 * @param encoding File encoding. Defaults to UTF 8.
 */
export async function writeFile(path: string, content: string, createPaths?: boolean, encoding: BufferEncoding = 'utf-8'): Promise<void> {
    if (createPaths) {
        const directory: string = Path.dirname(path);
        await fs.promises.mkdir(directory, { recursive: true });
    }

    return fs.promises.writeFile(path, content, encoding);
}


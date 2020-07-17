import fs from 'fs';
import Path from 'path';

export function pathIsFile(path: string): boolean {
    return fs.existsSync(path) && fs.statSync(path).isFile();
}

export function pathIsDirectory(path: string): boolean {
    return fs.existsSync(path) && fs.statSync(path).isDirectory();
}

export function getDirectoryContents(path: string): string[] {
    if (pathIsDirectory(path)) {
        return fs.readdirSync(path);
    } else {
        throw new Error(`Attempting to list files in directory that does not exist or is not a directory: '${path}'`);
    }
}

export function readFile(path: string): string {
    if (pathIsFile(path)) {
        return fs.readFileSync(path, 'utf-8');
    } else {
        throw new Error(`Attempting to read file that does not exist or is not a file: '${path}'`);
    }
}

export function writeFile(path: string, content: string, createPaths?: boolean): void {
    if (createPaths) {
        const directory: string = Path.dirname(path);
        fs.mkdirSync(directory, { recursive: true });
    }

    return fs.writeFileSync(path, content, 'utf-8');
}

export function expandPagePaths(pages: string[], basePath?: string): string[] {
    const outPages: string[] = [];

    for (const rawPath of pages) {
        expandPagePath(rawPath, basePath, outPages);
    }

    return outPages;
}

function expandPagePath(pagePath: string, basePath: string | undefined, outPaths: string[]): void {
    const realPath = basePath != undefined ? Path.resolve(basePath, pagePath) : Path.resolve(pagePath);

    // directories need to be reciursively searched
    if (pathIsDirectory(realPath)) {
        for (const subFile of getDirectoryContents(realPath)) {
            const subFilePath = Path.join(pagePath, subFile);

            // recurse with each directory content
            expandPagePath(subFilePath, basePath, outPaths);
        }
    }

    // HTML are added directly
    if (pathIsFile(realPath) && realPath.toLowerCase().endsWith('.html')) {
        outPaths.push(pagePath);
    }

    // other file types (such as links) are currently skipped
}

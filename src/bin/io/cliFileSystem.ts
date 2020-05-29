export default interface CliFileSystem {
    pathExists(path: string): boolean;
    pathIsFile(path: string): boolean;
    pathIsDirectory(path: string): boolean;

    getDirectoryContents(path: string): Array<string>;

    readFile(path: string): string;
    writeFile(path: string, content: string, createPaths?: boolean): void;

    getDirectoryName(path: string): string;
    getFileName(path: string): string;

    resolvePaths(...paths: Array<string>): string;
    relativePath(from: string, to: string): string;
}
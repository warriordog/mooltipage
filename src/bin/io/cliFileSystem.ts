export interface CliFileSystem {
    pathExists(path: string): boolean;
    pathIsFile(path: string): boolean;
    pathIsDirectory(path: string): boolean;

    getDirectoryContents(path: string): string[];

    readFile(path: string): string;
    writeFile(path: string, content: string, createPaths?: boolean): void;

    getDirectoryName(path: string): string;
    getFileName(path: string): string;

    resolvePaths(...paths: string[]): string;
    relativePath(from: string, to: string): string;
    joinPaths(...pathParts: string[]): string;

    getWorkingDirectory(): string;
}
import fs from 'fs';
import Path from 'path';
import process from 'process';

import { CliFileSystem } from './cliFileSystem';

export class NodeCliFileSystem implements CliFileSystem {
    pathExists(path: string): boolean {
        return fs.existsSync(path);
    }

    pathIsFile(path: string): boolean {
        return this.pathExists(path) && fs.statSync(path).isFile();
    }

    pathIsDirectory(path: string): boolean {
        return this.pathExists(path) && fs.statSync(path).isDirectory();
    }

    getDirectoryContents(path: string): string[] {
        if (this.pathIsDirectory(path)) {
            return fs.readdirSync(path);
        } else {
            throw new Error(`Attempting to list files in directory that does not exist or is not a directory: '${path}'`);
        }
    }

    readFile(path: string): string {
        if (this.pathIsFile(path)) {
            return fs.readFileSync(path, 'utf-8');
        } else {
            throw new Error(`Attempting to read file that does not exist or is not a file: '${path}'`);
        }
    }

    writeFile(path: string, content: string, createPaths?: boolean): void {
        if (createPaths) {
            const directory: string = this.getDirectoryName(path);
            fs.mkdirSync(directory, { recursive: true });
        }

        return fs.writeFileSync(path, content, 'utf-8');
    }

    getDirectoryName(path: string): string {
        return Path.dirname(path);
    }

    getFileName(path: string): string {
        return Path.basename(path);
    }

    resolvePaths(...paths: string[]): string {
        return Path.resolve(...paths);
    }

    relativePath(from: string, to: string): string {
        return Path.relative(from, to);
    }

    joinPaths(...pathParts: string[]): string {
        return Path.join(...pathParts);
    }

    getWorkingDirectory(): string {
        return process.cwd();
    }
}
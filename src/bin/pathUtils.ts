import { CliFileSystem } from './io/cliFileSystem';


export class PathUtils {
    private readonly cliFs: CliFileSystem;
    private readonly inPath?: string;

    constructor(cliFs: CliFileSystem, inPath?: string) {
        this.cliFs = cliFs;
        this.inPath = inPath;
    }
    
    expandPagePaths(pages: string[]): string[] {
        const outPages: string[] = [];

        for (const rawPath of pages) {
            this.expandPagePath(rawPath, outPages);
        }

        return outPages;
    }

    private expandPagePath(pagePath: string, outPaths: string[]): void {
        const realPath = this.resolvePath(pagePath, this.inPath);
        console.log(`'${pagePath}' -> '${realPath}'`);

        // directories need to be reciursively searched
        if (this.cliFs.pathIsDirectory(realPath)) {
            for (const subFile of this.cliFs.getDirectoryContents(realPath)) {
                const subFilePath = this.cliFs.joinPaths(pagePath, subFile);

                // recurse with each directory content
                this.expandPagePath(subFilePath, outPaths);
            }
        }

        // HTML are added directly
        if (this.cliFs.pathIsFile(realPath) && realPath.toLowerCase().endsWith('.html')) {
            outPaths.push(pagePath);
        }

        // other file types (such as links) are currently skipped
    }

    private resolvePath(rawPath: string, inPath?: string): string {
        if (inPath != undefined) {
            // resolve path to input directory, if specified
            return this.cliFs.resolvePaths(inPath, rawPath);
        } else {
            return rawPath;
        }
    }
}
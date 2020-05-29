import CliFileSystem from './io/cliFileSystem';
    
export default class PathUtils {
    private readonly cliFs: CliFileSystem;

    constructor(cliFs: CliFileSystem) {
        this.cliFs = cliFs;
    }
    
    extractHtmlPaths(pagePaths: Array<string>, basePath: string): Array<string> {
        const htmlPaths: Array<string> = new Array<string>();
    
        // process each input
        for (let pagePath of pagePaths) {
            this.extractHtmlFromPath(pagePath, basePath, htmlPaths);
        }
    
        return htmlPaths;
    }
    
    private extractHtmlFromPath(currPath: string, basePath: string, htmlPaths: Array<string>): void {
        const realPath: string = this.cliFs.resolvePaths(currPath);
    
        // add directory contents
        if (this.cliFs.pathIsDirectory(realPath)) {
            // loop through directory and process each file
            for (let file of this.cliFs.getDirectoryContents(realPath)) {
                this.extractHtmlFromPath(this.cliFs.resolvePaths(realPath, file), basePath, htmlPaths);
            }
    
        // add input files
        } else if (this.cliFs.pathIsFile(realPath) && realPath.endsWith('.html')) {
            const pipelinePath: string = this.cliFs.relativePath(basePath, realPath);
    
            htmlPaths.push(pipelinePath);
        }
    }
}
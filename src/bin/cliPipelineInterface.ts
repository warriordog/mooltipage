import { PipelineInterface } from '../lib/pipeline/pipelineInterface';
import { CliFileSystem } from './io/cliFileSystem';

export class CliPipelineInterface implements PipelineInterface {
    private readonly sourcePath?: string;
    private readonly destinationPath?: string;
    private readonly cliFs: CliFileSystem;

    constructor(cliFs: CliFileSystem, sourcePath?: string, destinationPath?: string) {
        this.cliFs = cliFs;
        this.sourcePath = sourcePath;
        this.destinationPath = destinationPath;
    }

    getHtml(resId: string): string {
        const htmlPath = this.resolveSourceResource(resId);

        return this.cliFs.readFile(htmlPath);
    }

    writeHtml(resId: string, content: string): void {
        const htmlPath = this.resolveDestinationResource(resId);

        this.cliFs.writeFile(htmlPath, content, true);
    }

    private resolveSourceResource(resId: string): string {
        return this.resolvePath(resId, this.sourcePath);
    }

    private resolveDestinationResource(resId: string): string {
        return this.resolvePath(resId, this.destinationPath);
    }

    private resolvePath(resId: string, directory?: string): string {
        if (directory != null) {
            return this.cliFs.resolvePaths(directory, resId);
        } else {
            return this.cliFs.resolvePaths(resId);
        }
    }
}
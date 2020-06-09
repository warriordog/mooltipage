import { PipelineInterface } from '../lib/pipeline/pipelineInterface';
import CliFileSystem from './io/cliFileSystem';

export default class CliPipelineInterface implements PipelineInterface {
    private readonly sourcePath: string | null;
    private readonly destinationPath: string | null;
    private readonly cliFs: CliFileSystem;

    constructor(cliFs: CliFileSystem, sourcePath: string | null, destinationPath: string | null) {
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
        return this.resolvePath(this.sourcePath, resId);
    }

    private resolveDestinationResource(resId: string): string {
        return this.resolvePath(this.destinationPath, resId);
    }

    private resolvePath(directory: string | null, resId: string): string {
        if (directory != null) {
            return this.cliFs.resolvePaths(directory, resId);
        } else {
            return this.cliFs.resolvePaths(resId);
        }
    }
}
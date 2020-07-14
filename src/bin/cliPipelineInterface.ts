import { PipelineInterface, ResourceType, getResourceTypeExtension } from '../lib/pipeline/pipelineInterface';
import { CliFileSystem } from './io/cliFileSystem';

export class CliPipelineInterface implements PipelineInterface {
    private readonly sourcePath?: string;
    private readonly destinationPath?: string;
    private readonly cliFs: CliFileSystem;
    private nextResIndex = 0;

    constructor(cliFs: CliFileSystem, sourcePath?: string, destinationPath?: string) {
        this.cliFs = cliFs;
        this.sourcePath = sourcePath;
        this.destinationPath = destinationPath;
    }

    getResource(type: ResourceType, resId: string): string {
        const htmlPath = this.resolveSourceResource(resId);

        return this.cliFs.readFile(htmlPath);
    }

    writeResource(type: ResourceType, resId: string, content: string): void {
        const htmlPath = this.resolveDestinationResource(resId);

        this.cliFs.writeFile(htmlPath, content, true);
    }

    // sourceResId is available as last parameter, if needed
    createResource(type: ResourceType, contents: string): string {
        const resId = this.createResId(type);

        this.writeResource(type, resId, contents);

        return resId;
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

    // TODO better implementation
    private createResId(type: ResourceType): string {
        const index = this.nextResIndex;
        this.nextResIndex++;

        const extension = getResourceTypeExtension(type);
        const fileName = `${ index }.${ extension }`;

        return this.cliFs.joinPaths('resources', fileName);
    }
}
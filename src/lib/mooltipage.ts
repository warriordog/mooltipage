import os from 'os';
import Path from 'path';

import { HtmlFormatter, BasicHtmlFormatter } from ".";
import { Pipeline } from './pipeline/pipeline';
import { PipelineInterface, ResourceType, getResourceTypeExtension } from './pipeline/pipelineInterface';
import { Page } from './pipeline/object/page';
import * as FsUtils from './fs/fsUtils';

export enum StandardFormatters {
    NONE = 'none',
    PRETTY = 'pretty',
    MINIMIZED = 'minimized'
}

export type PageCompiledCallback = (pagePath: string, html: string, page: Page) => void;

export interface MpOptions {
    readonly inPath?: string;
    readonly outPath?: string;
    readonly formatter?: string;

    readonly onPageCompiled?: PageCompiledCallback;
}

export class DefaultMpOptions implements MpOptions {
    formatter?: StandardFormatters.PRETTY;
}

export class Mooltipage {
    private readonly options: MpOptions;
    private readonly pipeline: Pipeline;

    constructor(options?: MpOptions) {
        if (options) {
            this.options = options;
        } else {
            this.options = new DefaultMpOptions()
        }

        this.pipeline = createPipeline(this.options);
    }

    processPages(pagePaths: string[]): void {
        for (const pagePath of pagePaths) {
            this.processPage(pagePath);
        }
    }

    processPage(pagePath: string): void {
        // compile page
        const output = this.pipeline.compilePage(pagePath);

        // callback
        if (this.options.onPageCompiled) {
            this.options.onPageCompiled(pagePath, output.html, output.page);
        }
    }
}

function createPipeline(options: MpOptions): Pipeline {
    // create the HTML formatter, if specified
    const formatter: HtmlFormatter | undefined = createFormatter(options);

    // create interface
    const pi: PipelineInterface = createPipelineInterface(options);

    // create pipeline
    return new Pipeline(pi, formatter);
}

function createPipelineInterface(options: MpOptions): PipelineInterface {
    return new NodePipelineInterface(options.inPath, options.outPath);
}

function createFormatter(options: MpOptions): HtmlFormatter | undefined {
    switch (options.formatter) {
        case 'pretty':
            return new BasicHtmlFormatter(true, os.EOL);
        case 'minimized':
            return new BasicHtmlFormatter(false);
        case 'none':
        case undefined:
            return undefined;
        default: {
            throw new Error(`Unknown HTML formatter: ${ options.formatter }`);
        }
    }
}

class NodePipelineInterface implements PipelineInterface {
    private readonly sourcePath?: string;
    private readonly destinationPath?: string;
    private nextResIndex = 0;

    constructor(sourcePath?: string, destinationPath?: string) {
        this.sourcePath = sourcePath;
        this.destinationPath = destinationPath;
    }

    getResource(type: ResourceType, resPath: string): string {
        const htmlPath = this.resolveSourceResource(resPath);

        return FsUtils.readFile(htmlPath);
    }

    writeResource(type: ResourceType, resPath: string, content: string): void {
        const htmlPath = this.resolveDestinationResource(resPath);

        FsUtils.writeFile(htmlPath, content, true);
    }

    // sourceResPath is available as last parameter, if needed
    createResource(type: ResourceType, contents: string): string {
        const resPath = this.createResPath(type);

        this.writeResource(type, resPath, contents);

        return resPath;
    }

    private resolveSourceResource(resPath: string): string {
        return this.resolvePath(resPath, this.sourcePath);
    }

    private resolveDestinationResource(resPath: string): string {
        return this.resolvePath(resPath, this.destinationPath);
    }

    private resolvePath(resPath: string, directory?: string): string {
        if (directory != null) {
            return Path.resolve(directory, resPath);
        } else {
            return Path.resolve(resPath);
        }
    }

    // TODO better implementation
    private createResPath(type: ResourceType): string {
        const index = this.nextResIndex;
        this.nextResIndex++;

        const extension = getResourceTypeExtension(type);
        const fileName = `${ index }.${ extension }`;

        return Path.join('resources', fileName);
    }
}

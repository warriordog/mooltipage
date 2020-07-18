import os from 'os';
import Path from 'path';

import { HtmlFormatter, BasicHtmlFormatter, Pipeline, PipelineInterface, ResourceType, getResourceTypeExtension, Page, FsUtils } from ".";

/**
 * List of built-in HTML formatters
 */
export enum StandardFormatters {
    /**
     * No formatter
     */
    NONE = 'none',

    /**
     * BasicHtmlFormatter in "pretty" mode
     */
    PRETTY = 'pretty',

    /**
     * BasicHtmlFormatter in "ugly" / minimization mode
     */
    MINIMIZED = 'minimized'
}

/**
 * Called whenever a page is compiled.
 * @param pagePath Path to the page
 * @param html HTML content of the page
 * @param page Compiled page object
 */
export type PageCompiledCallback = (pagePath: string, html: string, page: Page) => void;

/**
 * Options recognized by MooltiPage
 */
export interface MpOptions {
    /**
     * Path to look for input files.
     * Optional, defaults to current working directory.
     */
    readonly inPath?: string;

    /**
     * Path to place output files
     * Optional, defaults to current working directory.
     */
    readonly outPath?: string;

    /**
     * Name of the HTML formatter to use.
     * Optional, defaults to "pretty" formatter.
     */
    readonly formatter?: string;

    /**
     * Callback for page compilation. Optional.
     */
    readonly onPageCompiled?: PageCompiledCallback;
}

/**
 * Default Mooltipage options
 */
export class DefaultMpOptions implements MpOptions {
    formatter?: StandardFormatters.PRETTY;
}

/**
 * Mooltipage JS API entry point.
 */
export class Mooltipage {
    private readonly options: MpOptions;
    private readonly pipeline: Pipeline;

    /**
     * Constructs a new Mooltipage instance using the provided options, or defaults if not specified.
     * @param options Configuration options
     */
    constructor(options?: MpOptions) {
        if (options) {
            this.options = options;
        } else {
            this.options = new DefaultMpOptions()
        }

        this.pipeline = createPipeline(this.options);
    }

    /**
     * Compiles a list of pages.
     * @param pagePaths List paths to pages to compile
     */
    processPages(pagePaths: string[]): void {
        for (const pagePath of pagePaths) {
            this.processPage(pagePath);
        }
    }

    /**
     * Compiles a single page.
     * @param pagePath Path to page to compile
     */
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
    const pi = new NodePipelineInterface(options.inPath, options.outPath);
    // create pipeline
    return new Pipeline(pi, formatter);
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

/**
 * Pipeline interface that uses Node.JS file APIs
 */
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

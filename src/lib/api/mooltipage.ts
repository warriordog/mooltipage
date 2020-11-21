import {
    PipelineIOImpl,
    StandardPipeline
} from '../pipeline/standardPipeline';
import {
    HtmlFormatter,
    MimeType,
    Page,
    Pipeline,
    PipelineIO
} from '..';
import {
    createStandardHtmlFormatter,
    FormatterMode
} from '../pipeline/module/standardHtmlFormatter';

/**
 * Called whenever a page is compiled.
 * @param page Compiled Page object
 */
export type PageCompiledCallback = (page: Page) => void;

/**
 * Options recognized by Mooltipage
 * See {@link DefaultMpOptions} for default values
 */
export interface MpOptions {
    /**
     * Optional path to look for input files.
     * Defaults to current working directory.
     */
    readonly inPath?: string;

    /**
     * Optional path to place output files.
     * Defaults to current working directory.
     */
    readonly outPath?: string;

    /**
     * Optional custom pipeline IO to use.
     * The implementation MUST be configured to use the same values of {@link inPath} and {@link outPath}, if applicable.
     */
    readonly pipelineIO?: PipelineIO;

    /**
     * Optional name of the HTML formatter to use.
     * Defaults to standard formatter in "pretty" mode.
     * Recommended to switch to "minimized" mode for production builds.
     */
    readonly formatter?: string;

    /**
     * Optional callback for page compilation.
     */
    readonly onPageCompiled?: PageCompiledCallback;
}

/**
 * Default Mooltipage options
 */
export class DefaultMpOptions implements MpOptions {
    readonly formatter: FormatterMode.PRETTY = FormatterMode.PRETTY;
}

/**
 * Mooltipage JS API entry point.
 */
export class Mooltipage {
    /**
     * Configuration objects for this Mooltipage instance
     */
    readonly options: MpOptions;

    /**
     * Pipeline instance that will be used for the lifetime of this instance
     */
    readonly pipeline: Pipeline;

    /**
     * Constructs a new Mooltipage instance.
     * An options object can be passed to configure the instance.
     * If no options are provided, then {@link DefaultMpOptions} will be used.
     * @param options Configuration options
     */
    constructor(options?: MpOptions) {
        if (options !== undefined) {
            this.options = options;
        } else {
            this.options = new DefaultMpOptions();
        }

        this.pipeline = createPipeline(this.options);
    }

    /**
     * Compiles a list of pages.
     * @param pagePaths List paths to pages to compile
     */
    processPages(pagePaths: Iterable<string>): void {
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
        const page = this.pipeline.compilePage(pagePath);

        // callback
        if (this.options.onPageCompiled) {
            this.options.onPageCompiled(page);
        }
    }
}

/**
 * Creates a pipeline from an options object
 * @param options Options object to configure pipeline
 */
function createPipeline(options: MpOptions): Pipeline {
    // create the HTML formatter, if specified
    const formatter: HtmlFormatter = createStandardHtmlFormatter(options.formatter);

    // create pipeline IO
    const pipelineIO = createPipelineIO(options);

    // create pipeline
    return new StandardPipeline(pipelineIO, formatter);
}

function createPipelineIO(options: MpOptions): PipelineIO {
    if (options.pipelineIO !== undefined) {
        return options.pipelineIO;

    } else {
        const sourcePath = options.inPath ?? process.cwd();
        const destinationPath = options.outPath ?? process.cwd();
        return new PipelineIOImpl(sourcePath, destinationPath);
    }
}

/**
 * Gets the filename extension to use for a specified resource type.
 * Defaults to "dat" for unknown resource types.
 * @param resourceType Resource type to get extension for
 * @returns filename extension, without the dot.
 */
export function getResourceTypeExtension(resourceType: MimeType): string {
    switch (resourceType) {
        case MimeType.HTML: return 'html';
        case MimeType.CSS: return 'css';
        case MimeType.JAVASCRIPT: return 'js';
        case MimeType.JSON: return 'json';
        case MimeType.TEXT: return 'txt';
        default: return 'dat';
    }
}
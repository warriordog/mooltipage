import crypto
    from 'crypto';
import {PipelineCache} from './pipelineCache';
import {ResourceParser} from './module/resourceParser';
import {HtmlCompiler} from './module/htmlCompiler';
import {
    DependencyTracker,
    DocumentNode,
    Fragment,
    FragmentContext,
    HtmlFormatter,
    MimeType,
    Page,
    Pipeline
} from '..';
import {
    EvalContent,
    EvalContext,
    isExpressionString,
    parseExpression,
    parseScript
} from './module/evalEngine';
import {StandardHtmlFormatter} from './module/standardHtmlFormatter';
import {buildPage} from './module/pageBuilder';
import {computePathBetween} from '../fs/pathUtils';
import * as FsUtils
    from '../fs/fsUtils';
import Path
    from 'path';
import {getResourceTypeExtension} from '../api/mooltipage';

/**
 * Primary compilation pipeline.
 * Takes one raw, uncompiled page from the pipeline input, and writes one compiled, pure-html page to the pipeline output.
 * The produced page is fully compiled and ready to be rendered by a standard web browser.
 * Additionally, it will be formatted by any HTML Formatter provided.
 * 
 * Any incidental resources (such as stylesheets) will be fed to the pipeline interface via createResource().
 */
export class StandardPipeline implements Pipeline {

    readonly sourcePath: string;

    readonly destinationPath: string;

    /**
     * Caches reusable data for the pipeline
     */
    private readonly cache: PipelineCache;

    /**
     * Frontend / Backend for the pipeline
     */
    readonly pipelineIO: PipelineIO;
    
    /**
     * HTML formatter, if provided
     */
    readonly htmlFormatter: HtmlFormatter;

    /**
     * General content parser
     */
    readonly resourceParser: ResourceParser;

    /**
     * HTML compilation support
     */
    readonly htmlCompiler: HtmlCompiler;

    readonly dependencyTracker: PipelineDependencyTracker;

    /**
     * Create a new instance of the pipeline
     * @param sourcePath Path to the source directory root
     * @param destinationPath Path to the destination directory root
     * @param pipelineIO? Optional override for standard pipelineIO
     * @param htmlFormatter? Optional HTML formatter to use
     * @param resourceParser? Optional override for standard ResourceParser
     * @param htmlCompiler? Optional override for standard HtmlCompiler
     */
    constructor(sourcePath: string, destinationPath: string, pipelineIO?: PipelineIO, htmlFormatter?: HtmlFormatter, resourceParser?: ResourceParser, htmlCompiler?: HtmlCompiler) {
        // internal
        this.cache = new PipelineCache();

        // required
        this.sourcePath = sourcePath;
        this.destinationPath = destinationPath;
        this.dependencyTracker = new PipelineDependencyTracker();

        // overridable
        this.pipelineIO = pipelineIO ?? new PipelineIO(sourcePath, destinationPath);
        this.htmlFormatter = htmlFormatter ?? new StandardHtmlFormatter();
        this.resourceParser = resourceParser ?? new ResourceParser();
        this.htmlCompiler = htmlCompiler ?? new HtmlCompiler();
    }

    compilePage(resPath: string): Page {
        // compile fragment
        const pageFragment: Fragment = this.compileFragmentOnly(resPath);
        const pageDom: DocumentNode = pageFragment.dom;

        // compile as page
        buildPage(pageDom);

        // format page
        this.htmlFormatter.formatDom(pageDom);

        // serialize to html
        const rawHtml: string = pageDom.toHtml();

        // format html
        const formattedHtml: string = this.htmlFormatter.formatHtml(rawHtml);

        // write HTML
        this.pipelineIO.writeResource(MimeType.HTML, resPath, formattedHtml);

        // create and return page
        return {
            path: resPath,
            dom: pageDom,
            html: formattedHtml
        };
    }

    compileFragment(resPath: string, fragmentContext?: FragmentContext): Fragment {
        const fragment = this.compileFragmentOnly(resPath, fragmentContext);

        // Only format if this fragment is being compiled standalone instead of as part of a page.
        // If this fragment is being used elsewhere, then it will be formatted there.
        // Formatting is an expensive operation and should not be duplicated if possible.
        const isTopLevel = fragmentContext === undefined;
        if (isTopLevel) {
            this.htmlFormatter.formatDom(fragment.dom);
        }

        return fragment;
    }

    private compileFragmentOnly(resPath: string, fragmentContext?: FragmentContext): Fragment {
        // get fragment from cache or htmlSource
        const fragment: Fragment = this.getOrParseFragment(resPath);

        // create usage context if not provided
        if (fragmentContext === undefined) {
            fragmentContext = {
                slotContents: new Map(),
                scope: {},
                fragmentResPath: resPath,
                rootResPath: resPath // current path is also the root path
            };
        }

        // create pipeline context
        const pipelineContext: PipelineContext = {
            pipeline: this,
            fragment: fragment,
            fragmentContext: fragmentContext
        };

        // compile under current context
        this.htmlCompiler.compileFragment(fragment, pipelineContext);

        return fragment;
    }

    /**
     * Compiles a JS expression
     * Embedded scripts will be evaluated in the current context.
     * Plain text will be returned as-is.
     * 
     * @param value Text value
     * @param evalContext Current compilation context
     * @returns compiled value of the input value
     */
    compileExpression(value: string, evalContext: EvalContext): unknown {
        // check if this text contains JS code to evaluate
        if (isExpressionString(value)) {
            const expression = value.trim();
    
            // get function for script
            const expressionFunc = this.getOrParseExpression(expression);
            
            // execute it
            return expressionFunc.invoke(evalContext);
        }

        // value is plain string
        return value;
    }

    /**
     * Compiles and executes javascript.
     * The script can be multiple lines, and use any JS feature that is available within a function body.
     * Script will execute with the provided eval context.
     * 
     * @param script Javascript code
     * @param evalContext Context to execute in
     * @returns The return value of the script, if any.
     */
    compileScript(script: string, evalContext: EvalContext): unknown {
        const scriptText = script.trim();

        // get function for script
        const scriptFunc = this.getOrParseScript(scriptText);
        
        // execute it
        return scriptFunc.invoke(evalContext);
    }

    /**
     * Compiles CSS. Currently a no-op.
     * 
     * @param css CSS text
     * @returns Compile CSS text
     */
    compileCss(css: string): string {
        return css;
    }

    private createLinkableResource(type: MimeType, contents: string): string {
        // hash contents
        const contentsHash = hashMD5(contents);

        // get from cache, if present
        if (this.cache.hasCreatedResource(contentsHash)) {
            // get cached path
            return this.cache.getCreatedResource(contentsHash);
        }

        // if not in cache, then call PI to create resource
        const resPath = this.pipelineIO.createResource(type, contents);

        // store in cache
        this.cache.storeCreatedResource(contentsHash, resPath);

        return resPath;
    }

    /**
     * Links a created resource to the compilation output.
     * This method ONLY handles saving the contents, it does not compile them or attach them to the actual HTML.
     * This method is ONLY for created (incidental) resources.
     *
     * @param type Type of resource
     * @param contents Contents as a UTF-8 string
     * @param rootResPath Path to the "root" fragment where this resources will be referenced
     * @returns path to reference linked resource
     */
    linkResource(type: MimeType, contents: string, rootResPath: string): string {
        // create the resource and get the raw path
        const rawResPath = this.createLinkableResource(type, contents);

        // adjust path relative to the output page and directory
        return computePathBetween(this.destinationPath, rawResPath, rootResPath);
    }

    /**
     * Gets a raw (uncompiled) text resource
     * 
     * @param resPath Path to resource
     * @param mimeType Type of resource. Defaults to TEXT
     */
    getRawText(resPath: string, mimeType = MimeType.TEXT): string {
        return this.pipelineIO.getResource(mimeType, resPath);
    }

    reset(): void {
        // clear cache to reset state
        this.cache.clear();
    }

    private getOrParseFragment(resPath: string): Fragment {
        let fragment: Fragment;

        if (this.cache.hasFragment(resPath)) {
            // use cached fragment
            fragment = this.cache.getFragment(resPath);
        } else {
            // read HTML
            const html: string = this.pipelineIO.getResource(MimeType.HTML, resPath);

            // parse fragment
            const parsedFragment: Fragment = this.resourceParser.parseFragment(resPath, html);

            // keep in cache
            this.cache.storeFragment(parsedFragment);

            fragment = parsedFragment;
        }

        // return a clone
        return {
            path: fragment.path,
            dom: fragment.dom.clone()
        };
    }

    private getOrParseExpression(expression: string): EvalContent<unknown> {
        let expressionFunc: EvalContent<unknown>;

        // get from cache, if present
        if (this.cache.hasExpression(expression)) {
            expressionFunc = this.cache.getExpression(expression);
        } else {
            // compile text
            expressionFunc = parseExpression(expression);

            // store in cache
            this.cache.storeExpression(expression, expressionFunc);
        }

        return expressionFunc;
    }

    private getOrParseScript(script: string): EvalContent<unknown> {
        let scriptFunc: EvalContent<unknown>;

        // get from cache, if present
        if (this.cache.hasScript(script)) {
            scriptFunc = this.cache.getScript(script);
        } else {
            // compile script
            scriptFunc = parseScript(script);

            // store in cache
            this.cache.storeScript(script, scriptFunc);
        }

        return scriptFunc;
    }
}

/**
 * Create a NON-CRYPTOGRAPHIC (INSECURE) hash of some pipeline content.
 * Hash algorithm should be strong enough to use for caching, but does not need to be cryptographically secure.
 * This may be called many times by the pipeline, so the algorithm used should be reasonably fast as well.
 * 
 * Standard implementation uses MD5 as provided by the Node.JS Crypto module.
 * Override to change implementation
 * 
 * @param content Content to hash. Should be a UTF-8 string.
 * @returns Returns a hash of content as a Base64 string
 */
export function hashMD5(content: string): string {
    // create hash instance
    const md5 = crypto.createHash('md5');
    
    // load the content
    md5.update(content, 'utf8');

    // calculate the hash
    return md5.digest('base64');
}

/**
 * State data for the current unit of compilation in the pipeline
 */
export interface PipelineContext {
    /**
     * Current pipeline instance
     */
    readonly pipeline: StandardPipeline;

    /**
     * Fragment that is currently being compiled
     */
    readonly fragment: Fragment;

    /**
     * Fragment usage context
     */
    readonly fragmentContext: FragmentContext;
}

/**
 * Standard implementation of DependencyTracker
 *
 * TODO normalize paths after #28 is done
 */
export class PipelineDependencyTracker implements DependencyTracker {

    /**
     * Map of pages to dependencies
     * @private
     */
    private readonly pageDependencies = new Map<string, Set<string>>();

    /**
     * Map of resources to dependent pages
     * @private
     */
    private readonly resourceDependents = new Map<string, Set<string>>();

    getDependenciesForPage(pageResPath: string): Set<string> {
        let dependencyList = this.pageDependencies.get(pageResPath);
        if (dependencyList === undefined) {
            dependencyList = new Set();
            this.pageDependencies.set(pageResPath, dependencyList);
        }
        return dependencyList;
    }

    getDependentsForResource(resPath: string): Set<string> {
        let dependentsList = this.resourceDependents.get(resPath);
        if (dependentsList === undefined) {
            dependentsList = new Set();
            this.resourceDependents.set(resPath, dependentsList);
        }
        return dependentsList;
    }

    hasTrackedPage(pageResPath: string): boolean {
        return this.pageDependencies.has(pageResPath);
    }

    hasTrackedResource(resPath: string): boolean {
        return this.resourceDependents.has(resPath);
    }

    /**
     * Records a dependency between a page and a resource.
     * Both the page -> resource and resource -> page mappings will be updated.
     * @param pageResPath Path to page
     * @param resPath Path to resource
     */
    recordDependency(pageResPath: string, resPath: string): void {
        this.getDependenciesForPage(pageResPath).add(resPath);
        this.getDependentsForResource(resPath).add(pageResPath);
    }

    /**
     * Erases all recorded dependencies and resets the change tracker.
     */
    clear(): void {
        this.pageDependencies.clear();
        this.resourceDependents.clear();
    }
}

/**
 * Provides file I/O support to the pipeline
 */
export class PipelineIO {

    /**
     * Path to source directory
     */
    readonly sourcePath: string;

    /**
     * Path to destination directory
     */
    readonly destinationPath: string;
    
    /**
     * Creates a new NodePipelineInterface.
     *
     * @param sourcePath Path to source directory
     * @param destinationPath Path to destination directory
     */
    constructor(sourcePath: string, destinationPath: string) {
        this.sourcePath = sourcePath;
        this.destinationPath = destinationPath;
    }

    /**
     * Reads a resource of a specified type from the pipeline input.
     *
     * @param type Type of resource
     * @param resPath Relative path to resource (source and destination)
     * @returns text content of resource
     */
    getResource(type: MimeType, resPath: string): string {
        const htmlPath = this.resolveSourceResource(resPath);

        return FsUtils.readFile(htmlPath);
    }
    
    /**
     * Writes a resource of a specified type to the pipeline output.
     * This resource must exist in the pipeline source, for incidentally created resources use createResource()
     *
     * @param type Type of resource
     * @param resPath Relative path to resource (source and destination)
     * @param contents File contents as a UTF-8 string
     */
    writeResource(type: MimeType, resPath: string, contents: string): void {
        const htmlPath = this.resolveDestinationResource(resPath);

        FsUtils.writeFile(htmlPath, contents, true);
    }
    /**
     * Creates a new output resource and generates a resource path to reference it
     * This should be used for all incidentally created resources, such as external stylesheets.
     *
     * @param type MIME type of the new resource
     * @param contents File contents
     * @returns path to resource
     */
    createResource(type: MimeType, contents: string): string {
        const resPath = this.createResPath(type, contents);

        this.writeResource(type, resPath, contents);

        return resPath;
    }

    /**
     * Gets the real path to a resource, factoring in {@link sourcePath}.
     * @param resPath Raw path to resource
     * @returns Real path to resource
     */
    resolveSourceResource(resPath: string): string {
        return PipelineIO.resolvePath(resPath, this.sourcePath);
    }


    /**
     * Gets the real path to a resource, factoring in {@link destinationPath}.
     * @param resPath Raw path to resource
     * @returns Real path to resource
     */
    resolveDestinationResource(resPath: string): string {
        return PipelineIO.resolvePath(resPath, this.destinationPath);
    }

    /**
     * Creates a unique resource path for a generated resource
     * @param type MIME type of the resource to create
     * @param contents Contents of the file
     * @returns returns a unique resource path that is acceptable for the specified MIME type
     */
    createResPath(type: MimeType, contents: string): string {
        const contentHash = hashMD5(contents);
        const extension = getResourceTypeExtension(type);

        const fileName = `${ contentHash }.${ extension }`;

        return Path.join('resources', fileName);
    }

    private static resolvePath(resPath: string, directory?: string): string {
        if (directory != null) {
            return Path.resolve(directory, resPath);
        } else {
            return Path.resolve(resPath);
        }
    }
}
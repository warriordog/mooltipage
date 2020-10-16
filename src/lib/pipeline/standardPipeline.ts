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
    Pipeline,
    PipelineIO
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
import * as FsUtils
    from '../fs/fsUtils';
import Path
    from 'path';
import {getResourceTypeExtension} from '../api/mooltipage';
import {resolveResPath} from '../fs/pathUtils';

/**
 * Primary compilation pipeline.
 * Takes one raw, uncompiled page from the pipeline input, and writes one compiled, pure-html page to the pipeline output.
 * The produced page is fully compiled and ready to be rendered by a standard web browser.
 * Additionally, it will be formatted by any HTML Formatter provided.
 * 
 * Any incidental resources (such as stylesheets) will be fed to the pipeline interface via createResource().
 */
export class StandardPipeline implements Pipeline {
    /**
     * Caches reusable data for the pipeline
     */
    private readonly cache: PipelineCache;

    /**
     * Frontend / Backend for the pipeline
     */
    readonly pipelineIO: PipelineIOImpl;
    
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
     * @param pipelineIO? Optional override for standard pipelineIO
     * @param htmlFormatter?? Optional HTML formatter to use
     * @param resourceParser?? Optional override for standard ResourceParser
     * @param htmlCompiler?? Optional override for standard HtmlCompiler
     */
    constructor(pipelineIO: PipelineIOImpl, htmlFormatter?: HtmlFormatter, resourceParser?: ResourceParser, htmlCompiler?: HtmlCompiler) {
        // internal
        this.cache = new PipelineCache();

        // required
        this.pipelineIO = pipelineIO;
        this.dependencyTracker = new PipelineDependencyTracker();

        // overridable
        this.htmlFormatter = htmlFormatter ?? new StandardHtmlFormatter();
        this.resourceParser = resourceParser ?? new ResourceParser();
        this.htmlCompiler = htmlCompiler ?? new HtmlCompiler();
    }

    compilePage(resPath: string): Page {
        // resolve path to page
        resPath = resolveResPath(resPath);

        // remove this page and all dependencies from the cache, in case this is a recompile
        this.cache.removeFragment(resPath);
        for (const dependencyResPath of this.dependencyTracker.getDependenciesForPage(resPath)) {
            // not all dependencies are fragments, but that's OK because cache will ignore
            this.cache.removeFragment(dependencyResPath);
        }

        // reset tracked changes for this page, in case this is a recompile
        this.dependencyTracker.forgetTrackedPage(resPath);

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
        // resolve path to fragment
        resPath = resolveResPath(resPath);

        // compile fragment
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
        // get the root res path. If there is no context, then this fragment is the root resource.
        const rootResPath = fragmentContext?.rootResPath ?? resPath;

        // get fragment from cache or htmlSource
        const fragment: Fragment = this.getOrParseFragment(resPath, rootResPath);

        // create usage context if not provided
        if (fragmentContext === undefined) {
            fragmentContext = {
                slotContents: new Map(),
                scope: {},
                fragmentResPath: resPath,
                rootResPath: rootResPath
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
        return resolveResPath(rootResPath, rawResPath);
    }

    /**
     * Gets a raw (uncompiled) text-based resource
     *
     * @param resPath Path to resource
     * @param mimeType Type of resource.
     * @param rootResPath Path to the root fragment
     */
    getRawText(resPath: string, mimeType: MimeType, rootResPath: string): string {
        // resolve path to fragment
        resPath = resolveResPath(resPath);

        this.dependencyTracker.recordDependency(rootResPath, resPath);

        // get contents
        return this.pipelineIO.getResource(mimeType, resPath);
    }

    reset(): void {
        // clear cache to reset state
        this.cache.clear();

        // erase tracked dependencies
        this.dependencyTracker.clear();
    }

    private getOrParseFragment(resPath: string, rootResPath: string): Fragment {
        this.dependencyTracker.recordDependency(rootResPath, resPath);

        let fragment: Fragment;

        if (this.cache.hasFragment(resPath)) {
            // use cached fragment
            fragment = this.cache.getFragment(resPath);
        } else {
            // read HTML
            const html = this.pipelineIO.getResource(MimeType.HTML, resPath);

            // parse fragment
            const parsedFragment = this.resourceParser.parseFragment(resPath, html);

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
     * Removes a page from all tracked dependency relationships.
     * Any page -> resource or resource -> page dependency that involves pageResPath will be delete.
     * @param pageResPath Page to forget.
     */
    forgetTrackedPage(pageResPath: string): void {
        const pageDeps = this.pageDependencies.get(pageResPath);
        if (pageDeps !== undefined) {

            // remove resource -> page mappings
            for (const resPath of pageDeps) {
                this.getDependentsForResource(resPath).delete(pageResPath);
            }

            // delete all page -> resource mappings
            this.pageDependencies.delete(pageResPath);
        }
    }

    clear(): void {
        this.pageDependencies.clear();
        this.resourceDependents.clear();
    }

    getAllTrackedFiles(): Set<string> {
        const allFiles = new Set<string>();
        for (const page of this.pageDependencies.keys()) {
            allFiles.add(page);
        }
        for (const resource of this.resourceDependents.keys()) {
            allFiles.add(resource);
        }
        return allFiles;
    }
}

/**
 * Standard implementation of Pipeline IO.
 * This uses node.js APIs to access files on the local filesystem.
 */
export class PipelineIOImpl implements PipelineIO {

    readonly sourcePath: string;
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

    getResource(type: MimeType, resPath: string): string {
        const htmlPath = this.resolveSourceResource(resPath);

        return FsUtils.readFile(htmlPath);
    }

    writeResource(type: MimeType, resPath: string, contents: string): void {
        const htmlPath = this.resolveDestinationResource(resPath);

        FsUtils.writeFile(htmlPath, contents, true);
    }

    createResource(type: MimeType, contents: string): string {
        const resPath = this.createResPath(type, contents);

        this.writeResource(type, resPath, contents);

        return resPath;
    }

    resolveSourceResource(resPath: string): string {
        return Path.resolve(this.sourcePath, resPath);
    }

    resolveDestinationResource(resPath: string): string {
        return Path.resolve(this.destinationPath, resPath);
    }

    createResPath(type: MimeType, contents: string): string {
        const contentHash = hashMD5(contents);
        const extension = getResourceTypeExtension(type);

        const fileName = `${ contentHash }.${ extension }`;

        return Path.join('resources', fileName);
    }

    getSourceResPathForAbsolutePath(rawPath: string): string {
        return Path.relative(this.sourcePath, rawPath);
    }

    getDestinationResPathForAbsolutePath(rawPath: string): string {
        return Path.relative(this.destinationPath, rawPath);
    }
}
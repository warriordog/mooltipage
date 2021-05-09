import crypto
    from 'crypto';
import {ResourceParser} from './module/resourceParser';
import {HtmlCompiler} from './module/htmlCompiler';
import {
    DocumentNode,
    Fragment,
    FragmentContext,
    HtmlFormatter,
    MimeType,
    Page,
    Pipeline,
    PipelineCache,
    PipelineContext,
    PipelineIO,
    EvalContext,
    EvalFunction
} from '..';
import {
    invokeEvalFunc,
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
import {StandardPipelineCache} from './pipelineCache';

/**
 * Primary compilation pipeline.
 * Takes one raw, uncompiled page from the pipeline input, and writes one compiled, pure-html page to the pipeline output.
 * The produced page is fully compiled and ready to be rendered by a standard web browser.
 * Additionally, it will be formatted by any HTML Formatter provided.
 * 
 * Any incidental resources (such as stylesheets) will be fed to the pipeline interface via createResource().
 */
export class StandardPipeline implements Pipeline {
    readonly cache: PipelineCache;

    readonly pipelineIO: PipelineIOImpl;

    readonly htmlFormatter: HtmlFormatter;

    /**
     * General content parser
     */
    readonly resourceParser: ResourceParser;

    /**
     * HTML compilation support
     */
    readonly htmlCompiler: HtmlCompiler;


    /**
     * Create a new instance of the pipeline
     * @param pipelineIO? Optional override for standard pipelineIO
     * @param htmlFormatter?? Optional HTML formatter to use
     * @param resourceParser?? Optional override for standard ResourceParser
     * @param htmlCompiler?? Optional override for standard HtmlCompiler
     */
    constructor(pipelineIO: PipelineIOImpl, htmlFormatter?: HtmlFormatter, resourceParser?: ResourceParser, htmlCompiler?: HtmlCompiler) {
        this.cache = new StandardPipelineCache();

        this.pipelineIO = pipelineIO;

        this.htmlFormatter = htmlFormatter ?? new StandardHtmlFormatter();
        this.resourceParser = resourceParser ?? new ResourceParser();
        this.htmlCompiler = htmlCompiler ?? new HtmlCompiler();
    }

    async compilePage(resPath: string): Promise<Page> {
        // resolve path to page
        resPath = resolveResPath(resPath);

        // compile fragment
        const pageFragment: Fragment = await this.compileFragmentOnly(resPath);
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
        await this.pipelineIO.writeResource(MimeType.HTML, resPath, formattedHtml);

        // create and return page
        return {
            path: resPath,
            dom: pageDom,
            html: formattedHtml
        };
    }

    async compileFragment(resPath: string, fragmentContext?: FragmentContext): Promise<Fragment> {
        // resolve path to fragment
        resPath = resolveResPath(resPath);

        // compile fragment
        const fragment = await this.compileFragmentOnly(resPath, fragmentContext);

        // Only format if this fragment is being compiled standalone instead of as part of a page.
        // If this fragment is being used elsewhere, then it will be formatted there.
        // Formatting is an expensive operation and should not be duplicated if possible.
        const isTopLevel = fragmentContext === undefined;
        if (isTopLevel) {
            this.htmlFormatter.formatDom(fragment.dom);
        }

        return fragment;
    }

    private async compileFragmentOnly(resPath: string, fragmentContext?: FragmentContext): Promise<Fragment> {
        // get the root res path. If there is no context, then this fragment is the root resource.
        const rootResPath = fragmentContext?.rootResPath ?? resPath;

        // get fragment from cache or htmlSource
        const fragment = await this.getOrParseFragment(resPath);

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
        const pipelineContext: StandardPipelineContext = {
            pipeline: this,
            fragment: fragment,
            fragmentContext: fragmentContext
        };

        // compile under current context
        await this.htmlCompiler.compileFragment(fragment, pipelineContext);

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
            return invokeEvalFunc(expressionFunc, evalContext);
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
        return invokeEvalFunc(scriptFunc, evalContext);
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

    private async createLinkableResource(type: MimeType, contents: string): Promise<string> {
        // hash contents
        const contentsHash = hashMD5(contents);

        // get from cache, if present
        if (this.cache.createdResourceCache.has(contentsHash)) {
            // get cached path
            return this.cache.createdResourceCache.get(contentsHash);
        }

        // if not in cache, then call PI to create resource
        const resPath = await this.pipelineIO.createResource(type, contents);

        // store in cache
        this.cache.createdResourceCache.store(contentsHash, resPath);

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
    async linkResource(type: MimeType, contents: string, rootResPath: string): Promise<string> {
        // create the resource and get the raw path
        const rawResPath = await this.createLinkableResource(type, contents);

        // adjust path relative to the output page and directory
        return resolveResPath(rootResPath, rawResPath);
    }

    /**
     * Gets a raw (uncompiled) text-based resource
     *
     * @param resPath Path to resource
     * @param mimeType Type of resource.
     */
    async getRawText(resPath: string, mimeType: MimeType): Promise<string> {
        // resolve path to fragment
        resPath = resolveResPath(resPath);

        // get contents
        return await this.pipelineIO.getResource(mimeType, resPath);
    }

    reset(): void {
        // clear cache to reset state
        this.cache.clear();
    }

    private async getOrParseFragment(resPath: string): Promise<Fragment> {
        let fragment: Fragment;

        if (this.cache.fragmentCache.has(resPath)) {
            // use cached fragment
            fragment = this.cache.fragmentCache.get(resPath);

        } else {
            // read HTML
            const html = await this.pipelineIO.getResource(MimeType.HTML, resPath);

            // parse fragment
            const parsedFragment = this.resourceParser.parseFragment(resPath, html);

            // keep in cache
            this.cache.fragmentCache.store(parsedFragment.path, parsedFragment);

            fragment = parsedFragment;
        }

        // return a clone
        return {
            path: fragment.path,
            dom: fragment.dom.clone()
        };
    }

    private getOrParseExpression(expression: string): EvalFunction<unknown> {
        let expressionFunc: EvalFunction<unknown>;

        // get from cache, if present
        if (this.cache.expressionCache.has(expression)) {
            expressionFunc = this.cache.expressionCache.get(expression);
        } else {
            // compile text
            expressionFunc = parseExpression(expression);

            // store in cache
            this.cache.expressionCache.store(expression, expressionFunc);
        }

        return expressionFunc;
    }

    private getOrParseScript(script: string): EvalFunction<unknown> {
        let scriptFunc: EvalFunction<unknown>;

        // get from cache, if present
        if (this.cache.scriptCache.has(script)) {
            scriptFunc = this.cache.scriptCache.get(script);
        } else {
            // compile script
            scriptFunc = parseScript(script);

            // store in cache
            this.cache.scriptCache.store(script, scriptFunc);
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
 * Extension of {@link PipelineContext} that narrows the pipeline to a StandardPipeline
 */
export interface StandardPipelineContext extends PipelineContext {
    readonly pipeline: StandardPipeline;
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

    async getResource(type: MimeType, resPath: string): Promise<string> {
        const htmlPath = this.resolveSourceResource(resPath);

        return await FsUtils.readFile(htmlPath);
    }

    async writeResource(type: MimeType, resPath: string, contents: string): Promise<void> {
        const htmlPath = this.resolveDestinationResource(resPath);

        await FsUtils.writeFile(htmlPath, contents, true);
    }

    async createResource(type: MimeType, contents: string): Promise<string> {
        const resPath = this.createResPath(type, contents);

        await this.writeResource(type, resPath, contents);

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
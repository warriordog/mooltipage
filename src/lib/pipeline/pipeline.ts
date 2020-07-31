import { PipelineCache, PipelineInterface, HtmlFormatter, ResourceParser, HtmlCompiler, Page, ResourceType, Fragment, Component, DocumentNode, EvalContext, EvalVars, EvalScope, createRootEvalScope, EvalContent, bindStyle, isExpressionString, parseExpression, parseScript } from '..';
import crypto from 'crypto';
import { buildPage } from './module/pageBuilder';

/**
 * Primary compilation pipeline.
 * Takes one raw, uncompiled page from the pipeline input, and writes one compiled, pure-html page to the pipeline output.
 * The produced page is fully compiled and ready to be rendered by a standard web browser.
 * Additionally, it will be formatted by any HTML Formatter provided.
 * 
 * Any incidental resources (such as stylesheets) will be fed to the pipeline interface via createResource().
 */
export class Pipeline {
    /**
     * Caches reusable data for the pipline
     */
    private readonly cache: PipelineCache;

    /**
     * Frontend / Backend for the pipeline
     */
    readonly pipelineInterface: PipelineInterface;
    
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

    /**
     * Create a new instance of the pipeline
     * @param pipelineInterface Pipeline interface instance
     * @param htmlFormatter Optional HTML formatter to use
     * @param resourceParser Optional override for standard ResourceParser
     * @param htmlCompiler Optional override for standard HtmlCompiler
     * @param resourceBinder Optional override for standard ResourceBinder
     */
    constructor(pipelineInterface: PipelineInterface, htmlFormatter?: HtmlFormatter, resourceParser?: ResourceParser, htmlCompiler?: HtmlCompiler) {
        // internal
        this.cache = new PipelineCache();

        // required
        this.pipelineInterface = pipelineInterface;

        // overribable
        this.htmlFormatter = htmlFormatter ?? new HtmlFormatter();
        this.resourceParser = resourceParser ?? new ResourceParser(this);
        this.htmlCompiler = htmlCompiler ?? new HtmlCompiler();
    }

    /**
     * Compiles a page from start to finish.
     * This is the only entry point that should be called by user code.
     * 
     * @param resPath Path to the page, relative to both source and destination.
     * @returns a CompiledPage containing the Page instance and serialized / formatted HTML
     */
    compilePage(resPath: string): Page {
        // compile fragment
        const pageFragment: Fragment = this.compileFragment(resPath);
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
        this.pipelineInterface.writeResource(ResourceType.HTML, resPath, formattedHtml);

        // create and return page
        return new Page(resPath, pageDom, formattedHtml);
    }

    /**
     * Compiles a fragment.
     * 
     * @param resPath Path to fragment source
     * @param context Current usage context, if applicable
     * @returns Fragment instance
     */
    compileFragment(resPath: string, context?: PipelineContext): Fragment {
        // get fragment from cache or htmlSource
        const fragment: Fragment = this.getOrParseFragment(resPath);

        // create usage context if not provided
        if (context == undefined) {
            context = new PipelineContext(this, fragment);
        }

        // compile under current context
        this.htmlCompiler.compileHtml(fragment, context);

        return fragment;
    }

    /**
     * Compiles a component.
     * 
     * @param resPath Path to component source
     * @param usageContext Current usage context
     * @returns Fragment instance
     */
    compileComponent(resPath: string, baseContext: PipelineContext): Fragment {
        // get or parse component
        const component: Component = this.getOrParseComponent(resPath);

        // create fragment
        const fragDom: DocumentNode = component.template.dom;
        const fragResPath = component.template.srcResPath ?? resPath;
        const fragment = new Fragment(fragResPath, fragDom);

        // create component script instance
        const componentInstanceEvalContext = new EvalContext(fragment, baseContext, baseContext.rootScope);
        const componentInstance: EvalScope = component.script.scriptFunction.invoke(componentInstanceEvalContext);

        // add component script data to context
        const componentContext: PipelineContext = baseContext.createSubContext(baseContext.slotContents, baseContext.fragmentParams, componentInstance);

        // compile HTML
        this.htmlCompiler.compileHtml(fragment, componentContext);

        // compile styles
        if (component.style != undefined) {
            // compile CSS
            const compiledStyle = this.compileCss(component.style.styleContent);

            // bind to page
            bindStyle(component.resPath, compiledStyle, component.style.bindType, componentContext);
        }

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
     * Compiles and executes javascript from an external file.
     * The script can be multiple lines, and use any JS feature that is available within a function body.
     * Script will execute with the provided eval context.
     * 
     * @param resPath Path to script file
     * @param evalContext Context to execute in
     * @returns The return value of the script, if any.
     */
    compileExternalScript(resPath: string, evalContext: EvalContext): unknown {
        // get function for script
        const scriptFunc = this.getOrParseExternalScript(resPath);
        
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

    /**
     * Links a created resource to the compilation output.
     * This method ONLY handles saving the contents, it does not compile them or link them to the page context.
     * This method is ONLY for created (incidental) resources.
     * 
     * @internal
     * @param type Type of resource
     * @param contents Contents as a UTF-8 string
     * @param sourceResPath Path to the explicit resource that has produced this created resource
     * @returns path to reference linked resource
     */
    linkResource(type: ResourceType, contents: string, sourceResPath: string): string {
        // hash contents
        const contentsHash = this.fastHashContent(contents);

        // get from cache, if present
        if (this.cache.hasCreatedResource(contentsHash)) {
            // get cached path
            const originalResPath = this.cache.getCreatedResource(contentsHash);

            // allow PI to relink in case type and/or sourceResPath are different, and that matters.
            // default PI implementation does not include this method so nothing will happen
            if (this.pipelineInterface.reLinkCreatedResource != undefined) {
                return this.pipelineInterface.reLinkCreatedResource(type, contents, sourceResPath, originalResPath);
            } else {
                // if PI does not implement relinking, then we can safely reuse the old path
                return originalResPath;
            }
        }
        
        // if not in cache, then call PI to create resource
        const resPath = this.pipelineInterface.createResource(type, contents, sourceResPath);

        // store in cache
        this.cache.storeCreatedResource(contentsHash, resPath);

        return resPath;
    }

    /**
     * Gets a raw (parsed but uncompiled) fragment.
     * 
     * @internal
     * @param resPath Path to fragment
     * @returns Uncompiled fragment
     */
    getRawFragment(resPath: string): Fragment {
        return this.getOrParseFragment(resPath);
    }

    /**
     * Resets the pipeline to its initial state.
     */
    reset(): void {
        // clear cache to reset state
        this.cache.clear();
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
    protected fastHashContent(content: string): string {
        // create hash instance
        const md5 = crypto.createHash('md5');
        
        // load the content
        md5.update(content, 'utf8');

        // calculate the hash
        return md5.digest('base64');
    }

    private getOrParseFragment(resPath: string): Fragment {
        let fragment: Fragment;

        if (this.cache.hasFragment(resPath)) {
            // use cached fragment
            fragment = this.cache.getFragment(resPath);
        } else {
            // read HTML
            const html: string = this.pipelineInterface.getResource(ResourceType.HTML, resPath);

            // parse fragment
            const parsedFragment: Fragment = this.resourceParser.parseFragment(resPath, html);

            // keep in cache
            this.cache.storeFragment(parsedFragment);

            fragment = parsedFragment;
        }

        return fragment.clone();
    }

    private getOrParseComponent(resPath: string): Component {
        let component: Component;

        if (this.cache.hasComponent(resPath)) {
            // use cached component
            component = this.cache.getComponent(resPath);
        } else {
            // read HTML
            const html: string = this.pipelineInterface.getResource(ResourceType.HTML, resPath);

            // parse component
            const parsedComponent: Component = this.resourceParser.parseComponent(resPath, html);

            // keep in cache
            this.cache.storeComponent(parsedComponent);

            component = parsedComponent;
        }

        return component.clone();
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

    private getOrParseExternalScript(resPath: string): EvalContent<unknown> {
        let scriptFunc: EvalContent<unknown>;

        // get from cache, if present
        if (this.cache.hasExternalScript(resPath)) {
            scriptFunc = this.cache.getExternalScript(resPath);
        } else {
            // load resource
            const scriptResource = this.pipelineInterface.getResource(ResourceType.JAVASCRIPT, resPath);

            // compile script
            const script = scriptResource.trim();
            scriptFunc = this.getOrParseScript(script);

            // store in cache
            this.cache.storeExternalScript(resPath, scriptFunc);
        }

        return scriptFunc;
    }
}

/**
 * Contextual data regarding the current unit of compilation within the pipeline
 */
export class PipelineContext {
    /**
     * Current pipeline instance
     */
    readonly pipeline: Pipeline;

    /**
     * Current fragment that is being compiled
     */
    readonly fragment: Fragment;

    /**
     * Slot contents for the current fragment
     */
    readonly slotContents: Map<string, DocumentNode>;

    /**
     * Parameters to the current fragment
     */
    readonly fragmentParams: EvalVars;

    /**
     * Root eval scope. Contains fragment params and component instance data, if applicable
     */
    readonly rootScope: EvalScope;

    /**
     * Creates a new UsageContext
     * @param pipeline Current pipeline instance
     * @param fragment Page being compiled
     * @param slotContents Optional slot contents for the current fragment
     * @param fragmentParams Optional parameters to the current fragment
     * @param componentScope Optional instance of the current component
     */
    constructor(pipeline: Pipeline, fragment: Fragment, slotContents?: Map<string, DocumentNode>, fragmentParams?: EvalVars, componentScope?: EvalScope) {
        this.pipeline = pipeline;
        this.fragment = fragment;
        this.slotContents = slotContents ?? new Map();
        this.fragmentParams = fragmentParams ?? new Map();
        this.rootScope = createRootEvalScope(this.fragmentParams, componentScope);
    }

    /**
     * Creates a child context to be used for compiling a referenced resource.
     * Current page and other fixed information will be preserved, but per-fragment data will be replaced.
     * 
     * @param slotContents Slot contents to provide to child context
     * @param fragmentParams Parameters to child context
     * @param componentScope Component that contains child context, if applicable
     * @returns new UsageContext
     */
    createSubContext(slotContents?: Map<string, DocumentNode>, fragmentParams?: EvalVars, componentScope?: EvalScope): PipelineContext {
        return new PipelineContext(this.pipeline, this.fragment, slotContents, fragmentParams, componentScope);
    }
}

/**
 * Calculates the MD5 hash of a UTF8 string using Node.JS crypto APIs.
 * MD5 is an INSECURE hash so this should ONLY be used for non-security-sensitive tasks like caching.
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
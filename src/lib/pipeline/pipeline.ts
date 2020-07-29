import { PipelineCache, PipelineInterface, HtmlFormatter, ResourceParser, HtmlCompiler, ResourceBinder, HtmlSerializer, TextCompiler, ContentHasher, Page, UsageContext, ResourceType, Fragment, Component, DocumentNode, EvalContext, ComponentScriptInstance, EvalContent } from '..';
import { EvalEngine } from './module/evalEngine';

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
    readonly htmlFormatter?: HtmlFormatter;

    /**
     * General content parser
     */
    readonly resourceParser: ResourceParser;

    /**
     * HTML compilation support
     */
    readonly htmlCompiler: HtmlCompiler;

    /**
     * Bind non-HTML resources to a page
     */
    readonly resourceBinder: ResourceBinder;

    /**
     * HTML serialization support
     */
    readonly htmlSerializer: HtmlSerializer;

    /**
     * Text expression compilation support
     */
    readonly textCompiler: TextCompiler;

    /**
     * Content hashing functionality
     */
    readonly contentHasher: ContentHasher;

    /**
     * Parse and execute javascript and expressions
     */
    readonly evalEngine: EvalEngine;

    /**
     * Create a new instance of the pipeline
     * @param pipelineInterface Pipeline interface instance
     * @param htmlFormatter Optional HTML formatter to use
     * @param resourceParser Optional override for standard ResourceParser
     * @param htmlCompiler Optional override for standard HtmlCompiler
     * @param resourceBinder Optional override for standard ResourceBinder
     * @param htmlSerializer Optional override for standard HtmlSerializer
     * @param textCompiler Optional override for standard TextCompiler
     * @param contentHasher Optional override for standard ContentHasher
     * @param evalEngine Optional override for standard EvalEngine
     */
    constructor(pipelineInterface: PipelineInterface, htmlFormatter?: HtmlFormatter, resourceParser?: ResourceParser, htmlCompiler?: HtmlCompiler, resourceBinder?: ResourceBinder, htmlSerializer?: HtmlSerializer, textCompiler?: TextCompiler, contentHasher?: ContentHasher, evalEngine?: EvalEngine) {
        // internal
        this.cache = new PipelineCache();

        // required
        this.pipelineInterface = pipelineInterface;

        // optional
        this.htmlFormatter = htmlFormatter;

        // overribable
        this.resourceParser = resourceParser ?? new ResourceParser(this);
        this.htmlCompiler = htmlCompiler ?? new HtmlCompiler(this);
        this.resourceBinder = resourceBinder ?? new ResourceBinder(this);
        this.htmlSerializer = htmlSerializer ?? new HtmlSerializer();
        this.textCompiler = textCompiler ?? new TextCompiler();
        this.contentHasher = contentHasher ?? new ContentHasher();
        this.evalEngine = evalEngine ?? new EvalEngine();
    }

    /**
     * Compiles a page from start to finish.
     * This is the only entry point that should be called by user code.
     * 
     * @param resPath Path to the page, relative to both source and destination.
     * @returns a CompiledPage containing the Page instance and serialized / formatted HTML
     */
    compilePage(resPath: string): CompiledPage {
        // parse page HTML as fragment
        const pageFragment = this.getOrParseFragment(resPath);
        const pageDom = pageFragment.dom;

        // create page context
        const page = new Page(resPath, pageDom);
        const pageContext = new UsageContext(page);

        // compile page fragment
        this.htmlCompiler.compileHtml(pageFragment, pageContext);

        // format page
        if (this.htmlFormatter?.formatPage != undefined) {
            this.htmlFormatter.formatPage(page);
        }

        // serialize to html
        let pageHtml: string = this.htmlSerializer.serializePage(page);

        // format html
        if (this.htmlFormatter?.formatHtml != undefined) {
            pageHtml = this.htmlFormatter.formatHtml(resPath, pageHtml);
        }

        // write HTML
        this.pipelineInterface.writeResource(ResourceType.HTML, resPath, pageHtml);

        // return CompiledPage
        return {
            page: page,
            html: pageHtml
        };
    }

    /**
     * Compiles a fragment.
     * 
     * @internal
     * @param resPath Path to fragment source
     * @param usageContext Current usage context
     * @returns Fragment instance
     */
    compileFragment(resPath: string, usageContext: UsageContext): Fragment {
        // get fragment from cache or htmlSource
        const fragment: Fragment = this.getOrParseFragment(resPath);

        // compile under current context
        this.htmlCompiler.compileHtml(fragment, usageContext);

        // format fragment
        if (this.htmlFormatter?.formatFragment != undefined) {
            this.htmlFormatter.formatFragment(fragment, usageContext);
        }

        return fragment;
    }

    /**
     * Compiles a component.
     * 
     * @internal
     * @param resPath Path to component source
     * @param usageContext Current usage context
     * @returns Fragment instance
     */
    compileComponent(resPath: string, baseUsageContext: UsageContext): Fragment {
        // get or parse component
        const component: Component = this.getOrParseComponent(resPath);

        // create fragment
        const fragDom: DocumentNode = component.template.dom;
        const fragResPath = component.template.srcResPath ?? resPath;
        const fragment = new Fragment(fragResPath, fragDom);

        // create component script instance
        const componentInstanceEvalContext = new EvalContext(this, fragment, baseUsageContext, baseUsageContext.rootScope);
        const componentInstance: ComponentScriptInstance = component.script.scriptFunction.invoke(componentInstanceEvalContext);

        // add component script data to context
        const componentUsageContext: UsageContext = baseUsageContext.createSubContext(baseUsageContext.slotContents, baseUsageContext.fragmentParams, componentInstance);

        // compile HTML
        this.htmlCompiler.compileHtml(fragment, componentUsageContext);

        // compile styles
        if (component.style != undefined) {
            // compile CSS
            const compiledStyle = this.compileCss(component.style.styleContent);

            // bind to page
            this.resourceBinder.bindStyle(component.resPath, compiledStyle, component.style.bindType, componentUsageContext);
        }

        // format fragment
        if (this.htmlFormatter?.formatFragment != undefined) {
            this.htmlFormatter.formatFragment(fragment, componentUsageContext);
        }

        return fragment;
    }

    /**
     * Compiles text in a Document.
     * Embedded scripts will be evaluated in the current context.
     * Plain text will be returned as-is.
     * 
     * @internal
     * @param value Text value
     * @param evalContext Current compilation context
     * @returns compiled value of the input value
     */
    compileDomText(value: string, evalContext: EvalContext): unknown {
        // check if this text contains JS code to evaluate
        if (this.textCompiler.isExpression(value)) {
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
     * @internal
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
     * @internal
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
     * @internal
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
        const contentsHash = this.contentHasher.fastHashContent(contents);

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
            expressionFunc = this.textCompiler.compileExpression(expression);

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
            scriptFunc = this.evalEngine.parseScript(script);

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
 * The ouput of page compilation.
 * Contains compiled HTML and page DOM.
 */
export interface CompiledPage {
    /**
     * Compiled Page instance
     */
    page: Page;

    /**
     * Serialized and formatted HTML representation of the page
     */
    html: string;
}

import { Fragment } from './object/fragment';
import { PipelineCache } from './pipelineCache';
import { UsageContext } from './usageContext';
import { PipelineInterface, ResourceType } from './pipelineInterface';
import { HtmlFormatter } from './htmlFormatter';
import { ResourceParser } from './resourceParser';
import { HtmlSerializer }  from './htmlSerializer';
import { HtmlCompiler } from './htmlCompiler';
import { EvalContent, EvalContext } from './evalEngine';
import { Component, ComponentScriptInstance } from './object/component';
import { Page } from './object/page';
import { DocumentNode } from '../dom/node';
import { ResourceBinder } from './resourceBinder';
import { TextCompiler } from './textCompiler';
import { ContentHasher } from './contentHasher';

export class Pipeline {
    private readonly cache: PipelineCache;

    readonly pipelineInterface: PipelineInterface;
    readonly htmlFormatter?: HtmlFormatter;
    readonly resourceParser: ResourceParser;
    readonly htmlCompiler: HtmlCompiler;
    readonly resourceBinder: ResourceBinder;
    readonly htmlSerializer: HtmlSerializer;
    readonly textCompiler: TextCompiler;
    readonly contentHasher: ContentHasher;

    constructor(pipelineInterface: PipelineInterface, htmlFormatter?: HtmlFormatter, resourceParser?: ResourceParser, htmlCompiler?: HtmlCompiler, resourceBinder?: ResourceBinder, htmlSerializer?: HtmlSerializer, textCompiler?: TextCompiler, contentHasher?: ContentHasher) {
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
    }

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

    compileComponent(resPath: string, baseUsageContext: UsageContext): Fragment {
        // get or parse component
        const component: Component = this.getOrParseComponent(resPath);

        // create fragment
        const fragDom: DocumentNode = component.template.dom;
        const fragResPath = component.template.srcResPath ?? resPath;
        const fragment: Fragment = new Fragment(fragResPath, fragDom);

        // create component script instance
        const componentInstanceEvalContext: EvalContext = new EvalContext(this, fragment, baseUsageContext, new Map());
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

    compileDomText(value: string | null, evalContext: EvalContext): unknown {
        // value is null
        if (value == null) {
            return null;
        }

        // check if this text contains JS code to evaluate
        if (this.textCompiler.isScriptText(value)) {
            const scriptText = value.trim();

            // get function for script
            const scriptTextFunc = this.getOrParseScriptText(scriptText);
            
            // execute it
            const scriptTextOutput: unknown = scriptTextFunc.invoke(evalContext);

            return scriptTextOutput;
        }

        // value is plain string
        return value;
    }

    compileCss(css: string): string {
        return css;
    }

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

    getRawResource(type: ResourceType, resPath: string): string {
        return this.pipelineInterface.getResource(type, resPath);
    }

    getRawFragment(resPath: string): Fragment {
        return this.getOrParseFragment(resPath);
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

    private getOrParseScriptText(scriptText: string): EvalContent<unknown> {
        let scriptTextFunc: EvalContent<unknown>;

        // get from cache, if present
        if (this.cache.hasScriptText(scriptText)) {
            scriptTextFunc = this.cache.getScriptText(scriptText);
        } else {
            // compile text
            scriptTextFunc = this.textCompiler.compileScriptText(scriptText);

            // store in cache
            this.cache.storeScriptText(scriptText, scriptTextFunc);
        }

        return scriptTextFunc;
    }
}

export interface CompiledPage {
    page: Page;
    html: string;
}

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

export class Pipeline {
    private readonly cache: PipelineCache;

    readonly pipelineInterface: PipelineInterface;
    readonly htmlFormatter?: HtmlFormatter;
    readonly htmlParser: ResourceParser;
    readonly htmlCompiler: HtmlCompiler;
    readonly resourceBinder: ResourceBinder;
    readonly htmlSerializer: HtmlSerializer;
    readonly textCompiler: TextCompiler;

    constructor(pipelineInterface: PipelineInterface, htmlFormatter?: HtmlFormatter) {
        this.pipelineInterface = pipelineInterface;
        this.htmlFormatter = htmlFormatter;

        this.cache = new PipelineCache();
        this.htmlParser = new ResourceParser(this);
        this.htmlCompiler = new HtmlCompiler(this);
        this.resourceBinder = new ResourceBinder(this);
        this.htmlSerializer = new HtmlSerializer();
        this.textCompiler = new TextCompiler();
    }

    compilePage(resId: string): CompiledPage {
        // parse page
        const page: Page = this.getOrParsePage(resId);

        // create usage context for compile
        const usageContext: UsageContext = new UsageContext(page);

        // compile page
        this.htmlCompiler.compileHtml(page, usageContext);

        // format page
        if (this.htmlFormatter?.formatPage != undefined) {
            this.htmlFormatter.formatPage(page);
        }

        // serialize to HTML
        let outHtml: string = this.htmlSerializer.serializePage(page);

        // format HTML
        if (this.htmlFormatter?.formatHtml != undefined) {
            outHtml = this.htmlFormatter.formatHtml(resId, outHtml);
        }

        // write HTML
        this.pipelineInterface.writeResource(ResourceType.HTML, resId, outHtml);

        // create CompiledPage
        return {
            page: page,
            html: outHtml
        };
    }

    compileFragment(resId: string, usageContext: UsageContext): Fragment {
        // get fragment from cache or htmlSource
        const fragment: Fragment = this.getOrParseFragment(resId);

        // compile under current context
        this.htmlCompiler.compileHtml(fragment, usageContext);

        // format fragment
        if (this.htmlFormatter?.formatFragment != undefined) {
            this.htmlFormatter.formatFragment(fragment, usageContext);
        }

        return fragment;
    }

    compileComponent(resId: string, baseUsageContext: UsageContext): Fragment {
        // get or parse component
        const component: Component = this.getOrParseComponent(resId);

        // create fragment
        const fragDom: DocumentNode = component.template.dom;
        const fragResId = component.template.srcResId ?? resId;
        const fragment: Fragment = new Fragment(fragResId, fragDom);

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
            this.resourceBinder.bindStyle(component.resId, compiledStyle, component.style.bindType, componentUsageContext);
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

    linkResource(type: ResourceType, contents: string, sourceResId: string): string {
        return this.pipelineInterface.createResource(type, contents, sourceResId);
    }

    getRawResource(type: ResourceType, resId: string): string {
        return this.pipelineInterface.getResource(type, resId);
    }

    getRawFragment(resId: string): Fragment {
        return this.getOrParseFragment(resId);
    }

    reset(): void {
        // clear cache to reset state
        this.cache.clear();
    }

    private getOrParsePage(resId: string): Page {
        let page: Page;

        if (this.cache.hasPage(resId)) {
            // use cached page
            page = this.cache.getPage(resId);
        } else {
            // read HTML
            const html: string = this.pipelineInterface.getResource(ResourceType.HTML, resId);

            // parse page
            const parsedPage: Page = this.htmlParser.parsePage(resId, html);

            // keep in cache
            this.cache.storePage(parsedPage);

            page = parsedPage;
        }

        return page.clone();
    }

    private getOrParseFragment(resId: string): Fragment {
        let fragment: Fragment;

        if (this.cache.hasFragment(resId)) {
            // use cached fragment
            fragment = this.cache.getFragment(resId);
        } else {
            // read HTML
            const html: string = this.pipelineInterface.getResource(ResourceType.HTML, resId);

            // parse fragment
            const parsedFragment: Fragment = this.htmlParser.parseFragment(resId, html);

            // keep in cache
            this.cache.storeFragment(parsedFragment);

            fragment = parsedFragment;
        }

        return fragment.clone();
    }

    private getOrParseComponent(resId: string): Component {
        let component: Component;

        if (this.cache.hasComponent(resId)) {
            // use cached component
            component = this.cache.getComponent(resId);
        } else {
            // read HTML
            const html: string = this.pipelineInterface.getResource(ResourceType.HTML, resId);

            // parse component
            const parsedComponent: Component = this.htmlParser.parseComponent(resId, html);

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

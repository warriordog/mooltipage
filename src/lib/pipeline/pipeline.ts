import { Fragment } from './object/fragment';
import { PipelineCache } from './pipelineCache';
import { UsageContext } from './usageContext';
import { PipelineInterface } from './pipelineInterface';
import { HtmlFormatter } from './htmlFormatter';
import { HtmlParser } from './htmlParser';
import { HtmlSerializer }  from './htmlSerializer';
import { HtmlCompiler } from './htmlCompiler';
import { EvalContent, EvalContext, EvalEngine } from './evalEngine';
import { Component, ComponentScriptInstance } from './object/component';
import { Page } from './object/page';
import { DocumentNode } from '../dom/node';
import { CssCompiler } from './cssCompiler';

export class Pipeline {
    private readonly cache: PipelineCache;

    readonly pipelineInterface: PipelineInterface;
    readonly htmlFormatter?: HtmlFormatter;
    readonly htmlParser: HtmlParser;
    readonly htmlCompiler: HtmlCompiler;
    readonly cssCompiler: CssCompiler;
    readonly htmlSerializer: HtmlSerializer;
    readonly evalEngine: EvalEngine;

    constructor(pipelineInterface: PipelineInterface, htmlFormatter?: HtmlFormatter) {
        this.pipelineInterface = pipelineInterface;
        this.htmlFormatter = htmlFormatter;

        this.cache = new PipelineCache();
        this.evalEngine = new EvalEngine();
        this.htmlParser = new HtmlParser(this);
        this.htmlCompiler = new HtmlCompiler(this);
        this.cssCompiler = new CssCompiler(this);
        this.htmlSerializer = new HtmlSerializer(this);
    }

    compilePage(resId: string): Page {
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
        this.pipelineInterface.writeHtml(resId, outHtml);

        return page;
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
            this.cssCompiler.compileComponentStyle(component, component.style, componentUsageContext);
        }

        // format fragment
        if (this.htmlFormatter?.formatFragment != undefined) {
            this.htmlFormatter.formatFragment(fragment, componentUsageContext);
        }

        return fragment;
    }

    compileTemplateString(templateText: string): EvalContent<string> {
        const functionBody = templateText.trim();

        // return from cache if present
        if (this.cache.hasTemplateString(functionBody)) {
            return this.cache.getTemplateString(functionBody);
        }

        // parse into function
        const templateFunc: EvalContent<string> = this.evalEngine.parseTemplateString(functionBody);
        
        // store in cache
        this.cache.storeTemplateString(functionBody, templateFunc);

        // return it
        return templateFunc;
    }

    compileHandlebars(handlebarsText: string): EvalContent<unknown> {
        const functionBody = handlebarsText.trim();

        // return from cache if present
        if (this.cache.hasHandlebars(functionBody)) {
            return this.cache.getHandlebars(functionBody);
        }

        // parse into function
        const handlebarsFunc: EvalContent<unknown> = this.evalEngine.parseHandlebars(functionBody);
        
        // store in cache
        this.cache.storeHandlebars(functionBody, handlebarsFunc);

        // return it
        return handlebarsFunc;
    }

    compileDomText(value: string | null, evalContext: EvalContext): unknown {
        // value is null
        if (value == null) {
            return null;
        }

        // value is template string
        if (templateTextRegex.test(value)) {
            // compile template string
            const templateStringFunc: EvalContent<string> = this.compileTemplateString(value);

            // execute it
            const evaluatedString: string = templateStringFunc.invoke(evalContext);

            return evaluatedString;
        }

        // value is handlebars
        const handlebarsMatches: RegExpMatchArray | null = value.match(handlebarsRegex);
        if (handlebarsMatches != null && handlebarsMatches.length === 2) {
            // get JS code from handlebars test
            const handlebarCode: string = handlebarsMatches[1];

            // parse handlebars code
            const handlebarsFunc: EvalContent<unknown> = this.compileHandlebars(handlebarCode);

            // execute handlebars
            const handlebarsResult: unknown = handlebarsFunc.invoke(evalContext);

            return handlebarsResult;
        }

        // value is plain string
        return value;
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
            const html: string = this.pipelineInterface.getHtml(resId);

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
            const html: string = this.pipelineInterface.getHtml(resId);

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
            const html: string = this.pipelineInterface.getHtml(resId);

            // parse component
            const parsedComponent: Component = this.htmlParser.parseComponent(resId, html);

            // keep in cache
            this.cache.storeComponent(parsedComponent);

            component = parsedComponent;
        }

        return component.clone();
    }
}

// regular expression to detect a JS template string litteral
export const templateTextRegex = /\${(([^\\}]|\\}|\\)*)}/;

// regular expression to detect handlebars {{ }}
export const handlebarsRegex = /^\s*(?<!\\){{(.*)}}\s*$/;
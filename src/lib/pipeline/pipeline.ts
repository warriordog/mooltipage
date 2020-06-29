import { Fragment } from './object/fragment';
import { PipelineCache } from './pipelineCache';
import { UsageContext } from './usageContext';
import { PipelineInterface } from './pipelineInterface';
import { HtmlFormatter } from './htmlFormatter';
import { HtmlParser } from './htmlParser';
import { HtmlSerializer }  from './htmlSerializer';
import { HtmlCompiler } from './htmlCompiler';
import { EvalContent, EvalContext, EvalEngine } from './evalEngine';
import { Component } from './object/component';
import { Page } from './object/page';

export class Pipeline {
    private readonly cache: PipelineCache;
    private readonly pipelineInterface: PipelineInterface;
    private readonly htmlFormatter?: HtmlFormatter;
    private readonly htmlParser: HtmlParser;
    private readonly htmlCompiler: HtmlCompiler;
    private readonly htmlSerializer: HtmlSerializer;
    private readonly evalEngine: EvalEngine;

    constructor(pipelineInterface: PipelineInterface, htmlFormatter?: HtmlFormatter) {
        this.pipelineInterface = pipelineInterface;
        this.htmlFormatter = htmlFormatter;

        this.cache = new PipelineCache();
        this.evalEngine = new EvalEngine();
        this.htmlParser = new HtmlParser(this);
        this.htmlCompiler = new HtmlCompiler(this);
        this.htmlSerializer = new HtmlSerializer(this);
    }

    compilePage(resId: string): Fragment {
        // parse page
        //const page: Fragment = this.compileFragment(resId, usageContext);
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

    /*compileComponent(resId: string): Fragment {
        // get or parse component
        const component: Component = this.getOrParseComponent(resId);

        // create component instance

    }*/

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
}

// regular expression to detect a JS template string litteral
export const templateTextRegex = /\${(([^\\}]|\\}|\\)*)}/;

// regular expression to detect handlebars {{ }}
export const handlebarsRegex = /^\s*(?<!\\){{(.*)}}\s*$/;
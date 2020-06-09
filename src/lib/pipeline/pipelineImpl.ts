import { Pipeline } from './pipeline';
import { Fragment } from './fragment';
import { PipelineCache } from './pipelineCache';
import { UsageContext } from './usageContext';
import { HtmlSource } from './htmlSource';
import { HtmlDestination } from './htmlDestination';
import { HtmlFormatter } from './htmlFormatter';
import { HtmlParser } from './htmlParser';
import { HtmlSerializer }  from './htmlSerializer';
import { HtmlCompiler } from './htmlCompiler';
import { EvalContent, EvalContext, EvalEngine } from './evalEngine';

export class PipelineImpl implements Pipeline {
    private readonly cache: PipelineCache;
    private readonly htmlSource: HtmlSource;
    private readonly htmlDestination: HtmlDestination;
    private readonly htmlFormatter?: HtmlFormatter;
    private readonly htmlParser: HtmlParser;
    private readonly htmlCompiler: HtmlCompiler;
    private readonly htmlSerializer: HtmlSerializer;
    private readonly evalEngine: EvalEngine;

    constructor(htmlSource: HtmlSource, htmlDestination: HtmlDestination, htmlFormatter?: HtmlFormatter) {
        this.htmlSource = htmlSource;
        this.htmlDestination = htmlDestination;
        this.htmlFormatter = htmlFormatter;

        this.cache = new PipelineCache();
        this.evalEngine = new EvalEngine();
        this.htmlParser = new HtmlParser(this);
        this.htmlCompiler = new HtmlCompiler(this);
        this.htmlSerializer = new HtmlSerializer(this);
    }

    compileFragment(resId: string, usageContext: UsageContext): Fragment {
        // get fragment from cache or htmlSource
        const fragment: Fragment = this.createFragment(resId);

        // compile under current context
        this.htmlCompiler.compileFragment(fragment, usageContext);

        // format fragment
        if (this.htmlFormatter != undefined) {
            this.htmlFormatter.formatFragment(fragment, usageContext);
        }

        // apply page-only steps
        if (usageContext.isPage) {
            // serialize to HTML
            let outHtml: string = this.htmlSerializer.serializeFragment(fragment);

            // format HTML
            if (this.htmlFormatter != undefined) {
                outHtml = this.htmlFormatter.formatHtml(resId, outHtml);
            }

            // write HTML
            this.htmlDestination.writeHtml(resId, outHtml);
        }

        return fragment;
    }

    compilePage(resId: string) : Fragment {
        // create page usage context
        const usageContext: UsageContext = new UsageContext(true);

        // compile fragment as page
        const page: Fragment = this.compileFragment(resId, usageContext);

        return page;
    }

    compileTemplateString(templateText: string, evalContext: EvalContext): EvalContent<string> {
        // create signature
        const signature: string = this.evalEngine.getFunctionSignature(templateText, evalContext.vars);

        // return from cache if present
        if (this.cache.hasTemplateString(signature)) {
            return this.cache.getTemplateString(signature);
        }

        // parse into function
        const templateFunc: EvalContent<string> = this.evalEngine.parseTemplateString(templateText, evalContext.vars);
        
        // store in cache
        this.cache.storeTemplateString(signature, templateFunc);

        // return it
        return templateFunc;
    }

    compileHandlebars(handlebarsText: string, evalContext: EvalContext): EvalContent<unknown> {
        // create signature
        const signature: string = this.evalEngine.getFunctionSignature(handlebarsText, evalContext.vars);

        // return from cache if present
        if (this.cache.hasHandlebars(signature)) {
            return this.cache.getHandlebars(signature);
        }

        // parse into function
        const handlebarsFunc: EvalContent<unknown> = this.evalEngine.parseHandlebars(handlebarsText, evalContext.vars);
        
        // store in cache
        this.cache.storeHandlebars(signature, handlebarsFunc);

        // return it
        return handlebarsFunc;
    }

    reset(): void {
        // clear cache to reset state
        this.cache.clear();
    }

    protected createFragment(resId: string): Fragment {
        // get from cache or source
        const fragment: Fragment = this.getOrParseFragment(resId);

        // clone it to avoid corrupting shared copy
        const clonedFragment: Fragment = fragment.clone();

        return clonedFragment;
    }

    private getOrParseFragment(resId: string): Fragment {
        if (this.cache.hasFragment(resId)) {
            // use cached fragment
            return this.cache.getFragment(resId);
        } else {
            // read HTML
            const html: string = this.htmlSource.getHtml(resId);

            // parse fragment
            const fragment: Fragment = this.htmlParser.parseFragment(resId, html);

            // keep in cache
            this.cache.storeFragment(fragment);

            return fragment;
        }
    }
}
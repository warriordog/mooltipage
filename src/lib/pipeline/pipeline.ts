import { Fragment } from './fragment';
import { PipelineCache } from './pipelineCache';
import { UsageContext } from './usageContext';
import { PipelineInterface } from './pipelineInterface';
import { HtmlFormatter } from './htmlFormatter';
import { HtmlParser } from './htmlParser';
import { HtmlSerializer }  from './htmlSerializer';
import { HtmlCompiler } from './htmlCompiler';
import { EvalContent, EvalContext, EvalEngine } from './evalEngine';

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
            this.pipelineInterface.writeHtml(resId, outHtml);
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
        const functionBody = templateText.trim();

        // create signature
        const signature: string = this.evalEngine.getFunctionSignature(functionBody, evalContext.scope);

        // return from cache if present
        if (this.cache.hasTemplateString(signature)) {
            return this.cache.getTemplateString(signature);
        }

        // parse into function
        const templateFunc: EvalContent<string> = this.evalEngine.parseTemplateString(functionBody, evalContext.scope);
        
        // store in cache
        this.cache.storeTemplateString(signature, templateFunc);

        // return it
        return templateFunc;
    }

    executeTemplateString(templateText: string, evalContext: EvalContext): string {
        const templateFunc: EvalContent<string> = this.compileTemplateString(templateText, evalContext);

        const result: string = templateFunc.invoke(evalContext);

        return result;
    }

    compileHandlebars(handlebarsText: string, evalContext: EvalContext): EvalContent<unknown> {
        const functionBody = handlebarsText.trim();

        // create signature
        const signature: string = this.evalEngine.getFunctionSignature(functionBody, evalContext.scope);

        // return from cache if present
        if (this.cache.hasHandlebars(signature)) {
            return this.cache.getHandlebars(signature);
        }

        // parse into function
        const handlebarsFunc: EvalContent<unknown> = this.evalEngine.parseHandlebars(functionBody, evalContext.scope);
        
        // store in cache
        this.cache.storeHandlebars(signature, handlebarsFunc);

        // return it
        return handlebarsFunc;
    }

    executeHandlebars(handlebarsText: string, evalContext: EvalContext): unknown {
        const handlebarsFunc: EvalContent<unknown> = this.compileHandlebars(handlebarsText, evalContext);

        const result: unknown = handlebarsFunc.invoke(evalContext);

        return result;
    }

    compileDomText(value: string | null, evalContext: EvalContext): unknown {
        // value is null
        if (value == null) {
            return null;
        }

        // value is template string
        if (templateTextRegex.test(value)) {
            return this.executeTemplateString(value, evalContext);
        }

        // value is handlebars
        const handlebarsMatches: RegExpMatchArray | null = value.match(handlebarsRegex);
        if (handlebarsMatches != null && handlebarsMatches.length == 2) {
            const handlebarCode: string = handlebarsMatches[1];

            return this.executeHandlebars(handlebarCode, evalContext);
        }

        // value is plain string
        return value;
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
            const html: string = this.pipelineInterface.getHtml(resId);

            // parse fragment
            const fragment: Fragment = this.htmlParser.parseFragment(resId, html);

            // keep in cache
            this.cache.storeFragment(fragment);

            return fragment;
        }
    }
}

// regular expression to detect a JS template string litteral
export const templateTextRegex = /\${(([^\\}]|\\}|\\)*)}/;

// regular expression to detect handlebars {{ }}
export const handlebarsRegex = /^\s*(?<!\\){{(.*)}}\s*$/;
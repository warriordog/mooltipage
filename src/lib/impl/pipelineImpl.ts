import { Pipeline } from '../pipeline/pipeline';
import { Fragment } from '../pipeline/fragment';
import { Page } from '../pipeline/page';
import { PipelineCache } from '../pipeline/pipelineCache';
import { UsageContext } from '../pipeline/usageContext';
import { HtmlSource } from '../pipeline/htmlSource';
import { HtmlDestination } from '../pipeline/htmlDestination';
import { HtmlFormatter } from '../pipeline/htmlFormatter';
import { HtmlParser } from './htmlParser';
import { HtmlSerializer }  from './htmlSerializer';
import { HtmlCompiler } from './htmlCompiler';

export class PipelineImpl implements Pipeline {
    private readonly cache: PipelineCache;
    private readonly htmlSource: HtmlSource;
    private readonly htmlDestination: HtmlDestination;
    private readonly htmlFormatter?: HtmlFormatter;
    private readonly htmlParser: HtmlParser;
    private readonly htmlCompiler: HtmlCompiler;
    private readonly htmlSerializer: HtmlSerializer;

    constructor(htmlSource: HtmlSource, htmlDestination: HtmlDestination, htmlFormatter?: HtmlFormatter) {
        this.htmlSource = htmlSource;
        this.htmlDestination = htmlDestination;
        this.htmlFormatter = htmlFormatter;

        this.cache = new PipelineCache();
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
            this.htmlFormatter.formatFragment(fragment);
        }

        return fragment;
    }

    compilePage(resId: string) : Page {
        // get page from cache or htmlSource
        const page: Page = this.createPage(resId);

        // compile page
        this.htmlCompiler.compilePage(page);

        // format page
        if (this.htmlFormatter != undefined) {
            this.htmlFormatter.formatPage(page);
        }

        // serialize to HTML
        let outHtml: string = this.htmlSerializer.serializePage(page);

        // format HTML
        if (this.htmlFormatter != undefined) {
            outHtml = this.htmlFormatter.formatHtml(resId, outHtml);
        }

        // write HTML
        this.htmlDestination.writeHtml(resId, outHtml);

        return page;
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
        if (this.cache.hasPage(resId)) {
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

    protected createPage(resId: string): Page {
        // get from cache or source
        const page: Page = this.getOrParsePage(resId);

        // clone it to avoid corrupting shared copy
        const clonedPage: Page = page.clone();

        return clonedPage;
    }

    private getOrParsePage(resId: string): Page {
        if (this.cache.hasPage(resId)) {
            // use cached fragment
            return this.cache.getPage(resId);
        } else {
            // read HTML
            const html: string = this.htmlSource.getHtml(resId);
            
            // parse page
            const page: Page = this.htmlParser.parsePage(resId, html);

            // keep in cache
            this.cache.storePage(page);

            return page;
        }
    }
}
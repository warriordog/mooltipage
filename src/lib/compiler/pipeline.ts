import Fragment from "./fragment";
import Page from "./page";

export class Pipeline<TFragment extends Fragment<unknown>, TPage extends Page<unknown>, TSlot> {
    private readonly cache: PipelineCache<TFragment>;
    private readonly htmlSource: HtmlSource;
    private readonly htmlParser: HtmlParser<TFragment, TPage, TSlot>;
    private readonly htmlCompiler: HtmlCompiler<TFragment, TPage, TSlot>;
    private readonly htmlSerializer: HtmlSerializer<TFragment, TPage, TSlot>;
    private readonly htmlDestination: HtmlDestination;
    private readonly htmlFormatter?: HtmlFormatter<TFragment, TPage>

    constructor(htmlSource: HtmlSource, htmlParser: HtmlParser<TFragment, TPage, TSlot>, htmlCompiler: HtmlCompiler<TFragment, TPage, TSlot>, htmlSerializer: HtmlSerializer<TFragment, TPage, TSlot>, htmlDestination: HtmlDestination, htmlFormatter?: HtmlFormatter<TFragment, TPage>) {
        this.cache = new PipelineCache<TFragment>();
        this.htmlSource = htmlSource;
        this.htmlParser = htmlParser;
        this.htmlCompiler = htmlCompiler;
        this.htmlSerializer = htmlSerializer;
        this.htmlDestination = htmlDestination;
        this.htmlFormatter = htmlFormatter;
    }

    compileFragment(resId: string, usageContext: UsageContext<TSlot>): TFragment {
        // will get from cache if already parsed
        const parsedFragment: TFragment = this.getParsedFragment(resId);

        // will always recompile with current context
        let compiledFragment: TFragment = this.htmlCompiler.compileFragment(parsedFragment, usageContext, this);

        // format fragment
        if (this.htmlFormatter != undefined) {
            compiledFragment = this.htmlFormatter.formatFragment(compiledFragment);
        }

        return compiledFragment;
    }

    compilePage(resId: string) : TPage {
        // read html
        const inHtml: string = this.htmlSource.getHtml(resId);

        // parse into page
        const parsedPage: TPage = this.htmlParser.parsePage(resId, inHtml, this);

        // compile page
        let compiledPage: TPage = this.htmlCompiler.compilePage(parsedPage, this);

        // format page
        if (this.htmlFormatter != undefined) {
            compiledPage = this.htmlFormatter.formatPage(compiledPage);
        }

        // serialize to HTML
        let outHtml: string = this.htmlSerializer.serializePage(compiledPage, this);

        // format HTML
        if (this.htmlFormatter != undefined) {
            outHtml = this.htmlFormatter.formatHtml(resId, outHtml);
        }

        // write HTML
        this.htmlDestination.writeHtml(resId, outHtml);

        return compiledPage;
    }

    protected getParsedFragment(resId: string): TFragment {
        if (this.cache.hasFragment(resId)) {
            // use cached fragment
            return this.cache.getFragment(resId);
        } else {
            // parse fragment
            const fragment = this.parseFragment(resId);

            // keep in cache
            this.cache.storeFragment(resId, fragment);

            return fragment;
        }
    }

    protected parseFragment(resId: string): TFragment {
        const html: string = this.htmlSource.getHtml(resId);
        const fragment: TFragment = this.htmlParser.parseFragment(resId, html, this);

        return fragment;
    }
}

export interface HtmlSource {
    getHtml(resId: string): string;
}

export interface HtmlParser<TFragment extends Fragment<unknown>, TPage extends Page<unknown>, TSlot> {
    parseFragment(resId: string, html: string, pipeline: Pipeline<TFragment, TPage, TSlot>): TFragment;
    parsePage(resId: string, html: string, pipeline: Pipeline<TFragment, TPage, TSlot>): TPage;
}

export interface HtmlCompiler<TFragment extends Fragment<unknown>, TPage extends Page<unknown>, TSlot> {
    compileFragment(fragment: TFragment, usageContext: UsageContext<TSlot>, pipeline: Pipeline<TFragment, TPage, TSlot>): TFragment;
    compilePage(page: TPage, pipeline: Pipeline<TFragment, TPage, TSlot>): TPage;
} 

export interface HtmlSerializer<TFragment extends Fragment<unknown>, TPage extends Page<unknown>, TSlot> {
    serializePage(page: TPage, pipeline: Pipeline<TFragment, TPage, TSlot>): string;
}

export interface HtmlDestination {
    writeHtml(resId: string, html: string): void;
}

export interface HtmlFormatter<TFragment extends Fragment<unknown>, TPage extends Page<unknown>> {
    formatFragment(fragment: TFragment): TFragment;
    formatPage(page: TPage): TPage;
    formatHtml(resId: string, html: string): string;
}

export class UsageContext<TSlot> {
    readonly slotContents: Map<string, TSlot>;

    constructor(slotContents?: Map<string, TSlot>) {
        this.slotContents = slotContents ?? new Map<string, TSlot>();
    }
}

export class PipelineCache<TFragment> {
    private readonly parsedFragmentCache: Map<string, TFragment>;

    constructor() {
        this.parsedFragmentCache = new Map<string, TFragment>();
    }

    hasFragment(resId: string): boolean {
        return this.parsedFragmentCache.has(resId);
    }

    getFragment(resId: string): TFragment {
        const frag: TFragment | undefined = this.parsedFragmentCache.get(resId);

        if (frag === undefined) {
            throw new Error(`Fragment not found in cache: ${resId}.  Make sure to call hasFragment() before getFragment().`);
        }

        return frag;
    }

    storeFragment(resId: string, fragment: TFragment): void {
        this.parsedFragmentCache.set(resId, fragment);
    }
}
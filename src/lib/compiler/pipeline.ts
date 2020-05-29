import Fragment from "./fragment";
import Page from "./page";

export class Pipeline<TFragment extends Fragment, TPage extends Page, TSlot> {
    private readonly cache: PipelineCache<TFragment>;
    private readonly htmlSource: HtmlSource;
    private readonly htmlParser: HtmlParser<TFragment, TPage, TSlot>;
    private readonly htmlCompiler: HtmlCompiler<TFragment, TPage, TSlot>;
    private readonly htmlSerializer: HtmlSerializer<TFragment, TPage, TSlot>;
    private readonly htmlDestination: HtmlDestination;

    constructor(htmlSource: HtmlSource, htmlParser: HtmlParser<TFragment, TPage, TSlot>, htmlCompiler: HtmlCompiler<TFragment, TPage, TSlot>, htmlSerializer: HtmlSerializer<TFragment, TPage, TSlot>, htmlDestination: HtmlDestination) {
        this.cache = new PipelineCache<TFragment>();
        this.htmlSource = htmlSource;
        this.htmlParser = htmlParser;
        this.htmlCompiler = htmlCompiler;
        this.htmlSerializer = htmlSerializer;
        this.htmlDestination = htmlDestination;
    }

    compileFragment(resId: string, usageContext: UsageContext<TSlot>): TFragment {
        // will get from cache if already parsed
        const parsedFragment: TFragment = this.getParsedFragment(resId);

        // will always recompile with current context
        const compiledFragment: TFragment = this.htmlCompiler.compileFragment(parsedFragment, usageContext, this);

        return compiledFragment;
    }

    compilePage(resId: string) : void {
        // read html
        const inHtml: string = this.htmlSource.getHtml(resId);

        // parse into page
        const parsedPage: TPage = this.htmlParser.parsePage(resId, inHtml, this);

        // compile page
        const compiledPage: TPage = this.htmlCompiler.compilePage(parsedPage, this);

        // serialize to HTML
        const outHtml: string = this.htmlSerializer.serializePage(compiledPage, this);

        // write HTML
        this.htmlDestination.writeHtml(resId, outHtml);
    }

    private getParsedFragment(resId: string): TFragment {
        if (this.cache.hasFragment(resId)) {
            // use cached fragment
            return this.cache.getFragment(resId);
        } else {
            const html: string = this.htmlSource.getHtml(resId);
            const fragment: TFragment = this.htmlParser.parseFragment(resId, html, this);

            this.cache.storeFragment(resId, fragment);

            return fragment;
        }
    }
}

export interface HtmlSource {
    getHtml(resId: string): string;
}

export interface HtmlParser<TFragment extends Fragment, TPage extends Page, TSlot> {
    parseFragment(resId: string, html: string, pipeline: Pipeline<TFragment, TPage, TSlot>): TFragment;
    parsePage(resId: string, html: string, pipeline: Pipeline<TFragment, TPage, TSlot>): TPage;
}

export interface HtmlCompiler<TFragment extends Fragment, TPage extends Page, TSlot> {
    compileFragment(fragment: TFragment, usageContext: UsageContext<TSlot>, pipeline: Pipeline<TFragment, TPage, TSlot>): TFragment;
    compilePage(page: TPage, pipeline: Pipeline<TFragment, TPage, TSlot>): TPage;
}

export interface HtmlSerializer<TFragment extends Fragment, TPage extends Page, TSlot> {
    serializePage(page: TPage, pipeline: Pipeline<TFragment, TPage, TSlot>): string;
}

export interface HtmlDestination {
    writeHtml(resId: string, html: string): void;
}

export class UsageContext<TSlot> {
    readonly slotContents: Map<string, Array<TSlot>>;

    constructor(slotContents?: Map<string, Array<TSlot>>) {
        this.slotContents = slotContents ?? new Map<string, Array<TSlot>>();
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

    storeFragment(resId: string, fragment: TFragment) {
        this.parsedFragmentCache.set(resId, fragment);
    }
}
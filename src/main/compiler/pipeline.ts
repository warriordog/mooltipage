import Fragment from './fragment';
import jsdom from 'jsdom';
import TsCompat from '../utils/tsCompat';
import tsCompat from '../utils/tsCompat';

export class Pipeline {
    private readonly cache: PipelineCache;
    private readonly htmlSource: HtmlSource;
    private readonly htmlParser: HtmlParser;
    private readonly fragmentCompiler: FragmentCompiler;
    private readonly fragmentSerializer: FragmentSerializer;
    private readonly htmlDestination: HtmlDestination;

    constructor(htmlSource: HtmlSource, htmlParser: HtmlParser, fragmentCompiler: FragmentCompiler, fragmentSerializer: FragmentSerializer, htmlDestination: HtmlDestination) {
        this.cache = new PipelineCache();
        this.htmlSource = htmlSource;
        this.htmlParser = htmlParser;
        this.fragmentCompiler = fragmentCompiler;
        this.fragmentSerializer = fragmentSerializer;
        this.htmlDestination = htmlDestination;
    }

    processFragment(resId: string, usageContext?: UsageContext) {
        // create default context (explicit=true) if not provided
        if (usageContext == undefined) {
            usageContext = new UsageContext(true);
        }

        // will get from cache if already parsed
        const parsedFragment: Fragment = this.getOrProcessFragment(resId);

        // will always recompile with current context
        const compiledFragment: Fragment = this.fragmentCompiler.compileFragment(parsedFragment, usageContext, this);

        // run special explicit-only logic
        if (usageContext.isExplicit) {
            this.processExplicitFragment(resId, compiledFragment);
        }

        return compiledFragment;
    }

    private getOrProcessFragment(resId: string): Fragment {
        if (this.cache.hasFragment(resId)) {
            // use cached fragment
            return this.cache.getFragment(resId);
        } else {
            const html: string = this.htmlSource.readHtml(resId, this);
            const fragment: Fragment = this.htmlParser.parseHtml(resId, html, this);

            this.cache.storeFragment(resId, fragment);

            return fragment;
        }
    }
    
    private processExplicitFragment(resId: string, fragment: Fragment): void {
        // save exported fragments
        if (fragment.isExported) {
            // serialize to HTML
            const html: string = this.fragmentSerializer.serializeFragment(fragment, this);

            // export html
            this.htmlDestination.writeHtml(resId, html, this);
        }
    }
}

export interface HtmlSource {
    readHtml(resId: string, pipeline: Pipeline): string;
}

export class HtmlParser {
    parseHtml(resId: string, html: string, pipeline: Pipeline): Fragment {
        // parse HTML
        const fragment: Fragment = this.deserializeHtml(resId, html);

        // process fragment
        this.processMPage(fragment);
        this.removeMetaTags(fragment);

        return fragment;
    }

    private processMPage(fragment: Fragment): void {
        const mPage: HTMLElement = fragment.dom.querySelector('m-page') as HTMLElement;
        if (mPage != null) {
            fragment.isPage = true;

            if (mPage.hasAttribute('dest')) {
                fragment.isExported = true;
                fragment.exportPath = mPage.getAttribute('dest') || undefined;
            }
        }
    }

    private removeMetaTags(fragment: Fragment): void {
        // remove any m-page tags
        for (let node of fragment.dom.querySelectorAll('m-page')) {
            node.remove();
        }
    }

    private deserializeHtml(resId: string, html: string): Fragment {
        const dom: DocumentFragment = jsdom.JSDOM.fragment(html);
        return new Fragment(resId, dom);
    }
}

export class FragmentCompiler {
    compileFragment(fragment: Fragment, usageContext: UsageContext, pipeline: Pipeline): Fragment {
        // copy dom, so that we do not mutate shared cached copy
        const compiledDom: DocumentFragment = fragment.cloneDom();

        // fill in slots
        this.fillSlots(fragment, compiledDom, usageContext);

        // fill in fragments
        this.fillFragments(compiledDom, pipeline);

        // return new fragment
        return fragment.createCopyWithNewDom(compiledDom)
    }

    private fillSlots(fragment: Fragment, compiledDom: DocumentFragment, usageContext: UsageContext): void {
        this.fillElementSlots(compiledDom, usageContext);
        this.fillAttributeSlots(compiledDom, usageContext);
    }

    private fillElementSlots(compiledDom: DocumentFragment, usageContext: UsageContext): void {
        // get slots
        const elementSlots: Array<Element> = Array.from(compiledDom.querySelectorAll('m-slot'));
        
        // process each slot
        for (let slot of elementSlots) {
            // get slot name if specified, otherwise [default]
            const slotName: string = slot.hasAttribute('name') ? (slot.getAttribute('name') ?? '[default]').toLowerCase() : '[default]';

            // fill slot, or remove if no content provided
            if (usageContext.slotContents.has(slotName)) {
                slot.replaceWith(...(usageContext.slotContents.get(slotName) ?? new Array<HTMLElement>()));
            } else {
                slot.remove();
            }
        }
    }

    private fillAttributeSlots(compiledDom: DocumentFragment, usageContext: UsageContext): void {
        // get slots
        const attributeSlots: Array<Element> = Array.from(compiledDom.querySelectorAll('[m-slot]'));

        // process each slot
        for (let slot of attributeSlots) {
            // get slot name, or [default] if unspecified
            const slotName: string = slot.getAttribute('m-slot') || '[default]';

            // fill slot, or remove if no content provided
            if (usageContext.slotContents.has(slotName)) {
                slot.removeAttribute('m-slot');
                slot.append(...(usageContext.slotContents.get(slotName) ?? new Array<HTMLElement>()));
            } else {
                slot.removeAttribute('m-slot');
                slot.innerHTML = '';
            }
        }
    }

    private fillFragments(compiledDom: DocumentFragment, pipeline: Pipeline): void {
        // get all non-nested m-fragment elements
        const fragments: Array<Element> = this.getTopLevelElements(compiledDom, 'm-fragment');

        // process each fragment
        for (let mFragment of fragments) {
            if (mFragment.hasAttribute('src') && mFragment.getAttribute('src') != null) {
                // get fragment usage info
                const path: string = mFragment.getAttribute('src') as string;
                const slotContents: Map<string, Array<Node>> = this.getSlotContents(mFragment);
                const usageContext: UsageContext = new UsageContext(false, slotContents);

                // call pipeline to load fragment
                const compiledContents = pipeline.processFragment(path, usageContext);

                // replace with compiled fragment
                mFragment.replaceWith(compiledContents.cloneDom());
            } else {
                throw new Error('m-fragment element is missing required attribute "src"');
            }
        }
    }

    private getTopLevelElements(root: Node, tagName: string, elementList?: Array<Element>): Array<Element> {
        if (elementList == undefined) {
            elementList = new Array<Element>();
        }

        // loop through each child of the root
        for (let node of root.childNodes) {
            // special cast must be used to work around TS/NodeJS/JSDOM conflict
            const element = tsCompat.GetNodeAsElement(node);

            // check if child matches element
            if (element != null && element.tagName.toLowerCase() === tagName) {
                // Add the matching element, and do not process its children
                elementList.push(element);
            } else if (node.firstChild != null) {
                // recursively process nodes that do not match
                this.getTopLevelElements(node, tagName, elementList);
            }
        }

        return elementList;
    }

    private getSlotContents(mFragment: Node): Map<string, Node[]> {
        const defaultSlot: Array<Node> = [];
        const namedSlots: Map<string, Array<Node>> = new Map();

        // loop through all direct children of fragment reference
        for (let node of mFragment.childNodes) {
            // special cast must be used to work around TS/NodeJS/JSDOM conflict
            const element = tsCompat.GetNodeAsElement(node);

            // check if this element is an m-content
            if (element != null && element.tagName.toLowerCase() === 'm-content') {
                // check if it specified a slot
                if (element.hasAttribute('slot') && element.getAttribute('slot') != null) {
                    const slotName: string = (element.getAttribute('slot') as string).toLowerCase();

                    // check for duplicates
                    if (namedSlots.has(slotName)) {
                        throw new Error(`Duplicate slot: ${slotName}`);
                    }
                    
                    // save slot contents
                    namedSlots.set(slotName, Array.from(element.childNodes));
                } else {
                    // copy contents of <m-content>
                    defaultSlot.push(...element.childNodes);
                }
            } else {
                // Add to default slot
                defaultSlot.push(node);
            }
        }

        if (defaultSlot.length > 0) {
            namedSlots.set('[default]', defaultSlot);
        }

        return namedSlots;
    }
}

export class FragmentSerializer {
    serializeFragment(fragment: Fragment, pipeline: Pipeline): string {
        // create new page instance
        const newDom: jsdom.JSDOM = new jsdom.JSDOM('<!DOCTYPE HTML><html><head></head><body></body></html>');

        // extract m-head from fragment
        const compiledHead = fragment.dom.querySelector('m-head');
        if (compiledHead != null) {

            // find "real" head
            const newHead = newDom.window.document.querySelector('head');
            if (newHead == null) {
                throw new Error('Unable to find <head> in fragment template');
            }

            // copy everything from m-head to head
            while (compiledHead.firstChild != null) {
                newHead.append(compiledHead.firstChild);
            }
        }

        // extract m-body from fragment
        const compiledBody = fragment.dom.querySelector('m-body');
        if (compiledBody != null) {

            // find "real" body
            const newBody = newDom.window.document.querySelector('body');
            if (newBody == null) {
                throw new Error('Unable to find <body> in fragment template');
            }

            // copy everything from m-body to body
            while (compiledBody.firstChild != null) {
                newBody.append(compiledBody.firstChild);
            }
        }

        // serialize
        return newDom.serialize();
    }
}

export interface HtmlDestination {
    writeHtml(resId: string, content: string, pipeline: Pipeline): void;
}

export class UsageContext {
    readonly isExplicit: boolean;
    slotContents: Map<string, Array<Node>>;

    constructor(isExplicit: boolean, slotContents?:  Map<string, Array<Node>>) {
        this.isExplicit = isExplicit;
        this.slotContents = slotContents ?? new Map<string, Array<Node>>();
    }
}

export class PipelineCache {
    private readonly parsedFragmentCache: Map<string, Fragment>;

    constructor() {
        this.parsedFragmentCache = new Map<string, Fragment>();
    }

    hasFragment(resId: string): boolean {
        return this.parsedFragmentCache.has(resId);
    }

    getFragment(resId: string): Fragment {
        const frag: Fragment | undefined = this.parsedFragmentCache.get(resId);

        if (frag === undefined) {
            throw new Error(`Attempted to retrieve fragment before loading: ${resId}`);
        }

        return frag;
    }

    storeFragment(resId: string, fragment: Fragment) {
        this.parsedFragmentCache.set(resId, fragment);
    }
}
import { JSDOM } from 'jsdom';
import TsCompat from '../utils/tsCompat';
import { HtmlParser, HtmlCompiler, HtmlSerializer, Pipeline, HtmlSource, HtmlDestination, UsageContext } from '../compiler/pipeline';
import Fragment from '../compiler/fragment';
import Page from '../compiler/page';

export class JSDOMPipeline extends Pipeline<Fragment, JSDOMPage> {
    constructor(htmlSource: HtmlSource, htmlDestination: HtmlDestination) {
        super(htmlSource, new JSDOMHtmlParser(), new JSDOMHtmlCompiler(), new JSDOMHtmlSerializer(), htmlDestination);
    }
}

export class JSDOMPage extends Page {
    readonly jsdom: JSDOM;

    constructor(resId: string, jsdom: JSDOM) {
        super(resId, jsdom.window.document);
        this.jsdom = jsdom;
    }
}

export class JSDOMHtmlParser implements HtmlParser<Fragment, JSDOMPage> {
    parseFragment(resId: string, html: string, pipeline: Pipeline<Fragment, JSDOMPage>): Fragment {
        // parse HTML
        const dom: DocumentFragment = JSDOM.fragment(html);

        // create fragment
        return new Fragment(resId, dom);
    }

    parsePage(resId: string, html: string, pipeline: Pipeline<Fragment, JSDOMPage>): JSDOMPage {
        // parse HTML
        const jsdom = new JSDOM(html);

        // create page
        return new JSDOMPage(resId, jsdom);
    }
}

export class JSDOMHtmlCompiler implements HtmlCompiler<Fragment, JSDOMPage> {
    compileFragment(fragment: Fragment, usageContext: UsageContext, pipeline: Pipeline<Fragment, JSDOMPage>): Fragment {
        // copy dom, so that we do not mutate shared cached copy
        const compiledDom: DocumentFragment = fragment.cloneDom();

        // fill in slots
        this.fillSlots(compiledDom, usageContext);

        // fill in fragments
        this.fillFragments(compiledDom, pipeline);

        // return new fragment
        return new Fragment(fragment.resId, compiledDom);
    }

    compilePage(page: JSDOMPage, pipeline: Pipeline<Fragment, JSDOMPage>): JSDOMPage {
        // fill in fragments
        this.fillFragments(page.dom, pipeline);

        // return same page, pages are not cached
        return page;
    }

    private fillSlots(dom: DocumentFragment, usageContext: UsageContext): void {
        this.fillElementSlots(dom, usageContext);
        this.fillAttributeSlots(dom, usageContext);
    }

    private fillElementSlots(dom: DocumentFragment, usageContext: UsageContext): void {
        // get slots
        const elementSlots: Array<Element> = Array.from(dom.querySelectorAll('m-slot'));
        
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

    private fillFragments(dom: DocumentFragment | Document, pipeline: Pipeline<Fragment, JSDOMPage>): void {
        // get all non-nested m-fragment elements
        const fragments: Array<Element> = this.getTopLevelElements(dom, 'm-fragment');

        // process each fragment
        for (let mFragment of fragments) {
            // make sure fragment has src attribute, which is required
            if (mFragment.hasAttribute('src') && mFragment.getAttribute('src') != null) {
                // get fragment usage info
                const path: string = mFragment.getAttribute('src') as string;
                const slotContents: Map<string, Array<Node>> = this.getSlotContents(mFragment);
                const usageContext: UsageContext = new UsageContext(slotContents);

                // call pipeline to load fragment
                const compiledContents = pipeline.compileFragment(path, usageContext);

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
            const element = TsCompat.GetNodeAsElement(node);

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
            const element = TsCompat.GetNodeAsElement(node);

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

export class JSDOMHtmlSerializer implements HtmlSerializer<Fragment, JSDOMPage> {
    serializePage(page: JSDOMPage, pipeline: Pipeline<Fragment, JSDOMPage>): string {
        return page.jsdom.serialize();
    }
}
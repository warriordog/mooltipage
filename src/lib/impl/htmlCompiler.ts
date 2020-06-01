import { Pipeline } from "../pipeline/pipeline";
import { Fragment } from "../pipeline/fragment";
import { Page } from "../pipeline/page";
import { UsageContext } from '../pipeline/usageContext';
import { Dom } from '../pipeline/dom';
import { Node, Element, NodeWithChildren } from 'domhandler';
import * as DomUtils from 'domutils';
import * as DomTools from '../util/domTools';

export class HtmlCompiler {

    private readonly pipeline: Pipeline;

    constructor(pipeline: Pipeline) {
        this.pipeline = pipeline;
    }

    compileFragment(fragment: Fragment, usageContext: UsageContext): void {
        // get dom
        const dom: Dom = fragment.dom;

        // fill in slots
        this.fillSlots(dom, usageContext);

        // fill in fragments
        this.fillFragments(dom);
    }

    compilePage(page: Page): void {
        // get dom
        const dom: Dom = page.dom;

        // fill in fragments
        this.fillFragments(dom);
    }

    private fillSlots(dom: Dom, usageContext: UsageContext): void {
        this.fillElementSlots(dom, usageContext);
        this.fillAttributeSlots(dom, usageContext);
    }

    private fillElementSlots(dom: Dom, usageContext: UsageContext): void {
        // get slots
        const elementSlots: Element[] = DomUtils.findAll((elem: Element) => elem.tagName === 'm-slot', dom);
        
        // process each slot
        for (const slot of elementSlots) {
            // get slot name if specified, otherwise [default]
            const slotName: string = slot.attribs['name']?.toLowerCase() ?? '[default]';

            // fill slot, or remove if no content provided
            if (usageContext.slotContents.has(slotName)) {
                const replacement = usageContext.slotContents.get(slotName) as Node[];
                DomTools.removeNodes(replacement);
                DomTools.replaceElementList(slot, replacement);
            } else {
                DomUtils.removeElement(slot);
            }
        }
    }

    private fillAttributeSlots(dom: Dom, usageContext: UsageContext): void {
        // get slots
        const attributeSlots: Element[] = DomUtils.findAll((elem: Element) => elem.attribs['m-slot'] != undefined, dom);

        // process each slot
        for (const slot of attributeSlots) {
            // get slot name, or [default] if unspecified
            const slotName: string = slot.attribs['m-slot']?.toLowerCase() ?? '[default]';

            // fill slot, or remove if no content provided
            if (usageContext.slotContents.has(slotName)) {
                const replacement = usageContext.slotContents.get(slotName) as Node[];

                DomTools.removeNodes(replacement);
                DomTools.appendChildren(slot, replacement);

                delete slot.attribs['m-slot'];
            } else {
                DomTools.emptyNode(slot);

                delete slot.attribs['m-slot'];
            }
        }
    }

    private fillFragments(dom: Dom): void {
        // get all non-nested m-fragment elements
        const fragments: Element[] = DomTools.getAllTopLevelElements(dom, 'm-fragment');

        // process each fragment
        for (const mFragment of fragments) {
            // make sure fragment has src attribute, which is required
            if (mFragment.attribs['src'] != undefined) {
                // get fragment usage info
                const path: string = mFragment.attribs['src'];
                const slotContents: Map<string, Node[]> = this.getSlotContents(mFragment);
                const usageContext: UsageContext = new UsageContext(slotContents);

                // call pipeline to load fragment
                const compiledContents: Fragment = this.pipeline.compileFragment(path, usageContext);
                const contentsDom: Dom = compiledContents.dom;

                // remove replacements from original dom
                DomTools.removeNodes(contentsDom);

                // replace with compiled fragment
                DomTools.replaceElementList(mFragment, contentsDom);
            } else {
                throw new Error('m-fragment element is missing required attribute "src"');
            }
        }
    }

    private getSlotContents(mFragment: NodeWithChildren): Map<string, Node[]> {
        const defaultSlot: Node[] = [];
        const namedSlots: Map<string, Node[]> = new Map();

        // loop through all direct children of fragment reference
        for (const node of mFragment.childNodes) {
            if (DomUtils.isTag(node)) {
                // check if this element is an m-content
                if (node.tagName.toLowerCase() === 'm-content') {
                    // check if it specified a slot
                    const slotName: string = node.attribs['slot']?.toLowerCase();

                    if (slotName != undefined) {
                        // check for duplicates
                        if (namedSlots.has(slotName)) {
                            throw new Error(`Duplicate slot: ${slotName}`);
                        }
                        
                        // save slot contents
                        namedSlots.set(slotName, Array.from(node.childNodes));
                    } else {
                        // copy contents of <m-content>
                        defaultSlot.push(...node.childNodes);
                    }
                } else {
                    // Add to default slot
                    defaultSlot.push(node);
                }
            }
        }

        if (defaultSlot.length > 0) {
            namedSlots.set('[default]', defaultSlot);
        }

        // detatch contents
        for (const slot of namedSlots.values()) {
            DomTools.removeNodes(slot);
        }

        return namedSlots;
    }
}
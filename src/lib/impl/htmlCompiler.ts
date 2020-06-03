import { Pipeline } from "../pipeline/pipeline";
import { Fragment } from "../pipeline/fragment";
import { Page } from "../pipeline/page";
import { UsageContext } from '../pipeline/usageContext';
import { Node, DocumentNode, TagNode, NodeWithChildren } from '../dom/node';

export class HtmlCompiler {

    private readonly pipeline: Pipeline;

    constructor(pipeline: Pipeline) {
        this.pipeline = pipeline;
    }

    compileFragment(fragment: Fragment, usageContext: UsageContext): void {
        // get dom
        const dom: DocumentNode = fragment.dom;

        // fill in slots
        this.fillSlots(dom, usageContext);

        // fill in fragments
        this.fillFragments(dom);
    }

    compilePage(page: Page): void {
        // get dom
        const dom: DocumentNode = page.dom;

        // fill in fragments
        this.fillFragments(dom);
    }

    private fillSlots(dom: DocumentNode, usageContext: UsageContext): void {
        this.fillElementSlots(dom, usageContext);
        this.fillAttributeSlots(dom, usageContext);
    }

    private fillElementSlots(dom: DocumentNode, usageContext: UsageContext): void {
        // get slots
        const elementSlots: TagNode[] = dom.findChildTags((tag: TagNode) => tag.tagName === 'm-slot', true);
        
        // process each slot
        for (const slot of elementSlots) {
            // get slot name if specified, otherwise [default]
            const slotName: string = slot.attributes.get('name')?.toLowerCase() ?? '[default]';

            // fill slot, or remove if no content provided
            if (usageContext.slotContents.has(slotName)) {
                // get nodes to go in slot
                const replacementDom: DocumentNode = usageContext.slotContents.get(slotName) as DocumentNode;

                // replace slot
                slot.replaceSelf(...replacementDom.childNodes);

                // remove slot contents, as they are now used
                usageContext.slotContents.delete(slotName);
            } else {
                slot.removeSelf();
            }
        }
    }

    private fillAttributeSlots(dom: DocumentNode, usageContext: UsageContext): void {
        // get slots
        const attributeSlots: TagNode[] = dom.findChildTags((tag: TagNode) => tag.hasAttribute('m-slot'), true);

        // process each slot
        for (const slot of attributeSlots) {
            // get slot name, or [default] if unspecified
            const slotName: string = slot.attributes.get('m-slot')?.toLowerCase() ?? '[default]';

            // fill slot, or remove if no content provided
            if (usageContext.slotContents.has(slotName)) {
                // get nodes to go in slot
                const replacementDom: DocumentNode = usageContext.slotContents.get(slotName) as DocumentNode;
                
                // fill slot
                slot.appendChildren(replacementDom.childNodes);
                slot.attributes.delete('m-slot');

                // remove slot contents, as they are now used
                usageContext.slotContents.delete(slotName);
            } else {                
                slot.clear();
                slot.attributes.delete('m-slot');
            }
        }
    }

    private fillFragments(dom: DocumentNode): void {
        // get all non-nested m-fragment elements
        const fragments: TagNode[] = dom.findTopLevelChildTags((tag: TagNode) => tag.tagName === 'm-fragment');

        // process each fragment
        for (const mFragment of fragments) {
            // make sure fragment has src attribute, which is required
            if (!mFragment.attributes.has('src')) {
                throw new Error('m-fragment element is missing required attribute "src"');
            }

            // get fragment usage info
            const path = mFragment.attributes.get('src');

            if (path == null) {
                throw new Error('m-fragment element is missing value for required attribute "src"');
            }

            const slotContents: Map<string, DocumentNode> = this.buildSlotContentMap(mFragment);
            const usageContext: UsageContext = new UsageContext(slotContents);

            // call pipeline to load fragment
            const compiledContents: Fragment = this.pipeline.compileFragment(path, usageContext);

            // replace with compiled fragment
            mFragment.replaceSelf(...compiledContents.dom.childNodes)
        }
    }

    private buildSlotContentMap(mFragment: NodeWithChildren): Map<string, DocumentNode> {
        const slotMap: Map<string, DocumentNode> = new Map();

        // loop through all direct children of fragment reference
        for (const node of Array.from(mFragment.childNodes)) {
            // get content for this slot
            const slotContents: Node[] = this.getMContents(node);

            // check if it specified a slot
            const slotName: string = this.getContentSlot(node);

            // get dom for this slot
            const slotDom: DocumentNode = this.getDomForSlotContent(slotMap, slotName);

            // detatch slot contents from existing DOM
            for (const slotContentNode of slotContents) {
                slotContentNode.removeSelf();
            }

            // add slot contents to new DOM
            slotDom.appendChildren(slotContents);
        }

        return slotMap;
    }

    private getDomForSlotContent(slotMap: Map<string, DocumentNode>, slotName: string): DocumentNode {
        let slotDom: DocumentNode | undefined = slotMap.get(slotName);

        if (slotDom == undefined) {
            slotDom = new DocumentNode();
            slotMap.set(slotName, slotDom);
        }

        return slotDom;
    }

    private getMContents(node: Node): Node[] {
        // check if this element is an m-content
        if (TagNode.isTagNode(node) && node.tagName === 'm-content') {
            return node.childNodes;
        } else {
            return [ node ];
        }
    }

    private getContentSlot(node: Node): string {
        if (TagNode.isTagNode(node)) {
            return node.attributes.get('slot')?.toLowerCase() ?? '[default]';
        } else {
            return '[default]';
        }
    }
}
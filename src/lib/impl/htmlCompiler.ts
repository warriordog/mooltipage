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
        // find slots
        const slots: Slot[] = this.findSlots(dom);

        // fill or remove
        for (const slot of slots) {
            // get contents from context, and clone in case slot is repeated
            const content: DocumentNode | undefined = usageContext.slotContents.get(slot.name)?.clone();

            if (slot.isAttribute) {
                if (content != undefined) {
                    // fill attribute slot
                    slot.node.appendChildren(content.childNodes);
                } else {
                    // clear attribute slot
                    slot.node.clear();
                }
                
                // delete slot attribute, since slot is processed
                slot.node.attributes.delete('m-slot');
            } else {
                if (content != undefined) {
                    // fill tag slot
                    slot.node.replaceSelf(...content.childNodes);
                } else {
                    // remove tag slot
                    slot.node.removeSelf();
                }
            }
        }
    }

    private findSlots(dom: DocumentNode): Slot[] {
        // find slot nodes
        const slotNodes: TagNode[] = dom.findChildTags((node: TagNode) => node.tagName === 'm-slot' || node.hasAttribute('m-slot'));

        // convert to slots
        const slotObjects: Slot[] = slotNodes.map((slotNode: TagNode) => {
            if (slotNode.tagName === 'm-slot') {
                // create tag slot
                const slotName: string = slotNode.attributes.get('name')?.toLowerCase() ?? '[default]';
                return new Slot(slotName, slotNode, false);
            } else {
                // create attribute slot
                const slotName: string = slotNode.attributes.get('m-slot')?.toLowerCase() ?? '[default]';
                return new Slot(slotName, slotNode, true);
            }
        });

        return slotObjects;
    }

    private fillFragments(dom: DocumentNode): void {
        // get fragments
        const fragmentReferences: FragmentReference[] = this.findFragmentReferences(dom);
        
        // process each fragment
        for (const fragment of fragmentReferences) {
            // create usage context
            const usageContext = new UsageContext(fragment.slotContents);

            // call pipeline to load fragment
            const compiledContents: Fragment = this.pipeline.compileFragment(fragment.sourceResId, usageContext);

            // replace with compiled fragment
            fragment.node.replaceSelf(...compiledContents.dom.childNodes)
        }
    }

    private findFragmentReferences(dom: DocumentNode): FragmentReference[] {
        // get all non-nested m-fragment elements
        const fragments: TagNode[] = dom.findTopLevelChildTags((tag: TagNode) => tag.tagName === 'm-fragment');

        // convert to references
        const fragmentReferences: FragmentReference[] = fragments.map((node: TagNode) => {
            // get source
            const srcResId: string | null | undefined = node.attributes.get('src');

            // make sure src is specified
            if (srcResId == null) {
                throw new Error('m-fragment is missing required attribute: src');
            }
            
            // get slot contents
            const slotContents: SlotContentsMap = this.buildSlotContentMap(node);

            // create reference
            return new FragmentReference(srcResId, node, slotContents); 
        });

        return fragmentReferences;
    }

    private buildSlotContentMap(mFragment: NodeWithChildren): SlotContentsMap {
        const slotMap: SlotContentsMap = new Map();

        // loop through all direct children of fragment reference
        for (const node of Array.from(mFragment.childNodes)) {
            // get content for this slot
            const slotContents: Node[] = this.getSlotContentsFromNode(node);

            // check if it specified a slot
            const slotName: string = this.getSlotNameForContentNode(node);

            // get dom for this slot
            const slotDom: DocumentNode = this.getDomForSlot(slotMap, slotName);

            // add slot contents to new DOM (will automatically detach them)
            slotDom.appendChildren(slotContents);
        }

        return slotMap;
    }

    private getDomForSlot(slotMap: SlotContentsMap, slotName: string): DocumentNode {
        let slotDom: DocumentNode | undefined = slotMap.get(slotName);

        if (slotDom == undefined) {
            slotDom = new DocumentNode();
            slotMap.set(slotName, slotDom);
        }

        return slotDom;
    }

    private getSlotContentsFromNode(node: Node): Node[] {
        // check if this element is an m-content
        if (TagNode.isTagNode(node) && node.tagName === 'm-content') {
            return node.childNodes;
        } else {
            return [ node ];
        }
    }

    private getSlotNameForContentNode(node: Node): string {
        if (TagNode.isTagNode(node)) {
            return node.attributes.get('slot')?.toLowerCase() ?? '[default]';
        } else {
            return '[default]';
        }
    }
}

type SlotContentsMap = Map<string, DocumentNode>;

class FragmentReference {
    readonly sourceResId: string;
    readonly slotContents: SlotContentsMap;
    readonly node: TagNode;

    constructor(sourceResId: string, node: TagNode, slotContents: SlotContentsMap) {
        this.sourceResId = sourceResId;
        this.node = node;
        this.slotContents = slotContents;
    }
}

class Slot {
    readonly name: string;
    readonly isAttribute: boolean;
    readonly node: TagNode;

    constructor(name: string, node: TagNode, isAttribute: boolean) {
        this.name = name;
        this.node = node;
        this.isAttribute = isAttribute;
    }
}
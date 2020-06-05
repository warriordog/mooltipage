import { CompilerModule } from "../htmlCompiler";
import { Pipeline } from "../../pipeline/pipeline";
import { Fragment } from "../../pipeline/fragment";
import { Page } from "../../pipeline/page";
import { UsageContext } from "../../pipeline/usageContext";
import { Node, DocumentNode, TagNode, NodeWithChildren } from "../../dom/node";

export class FragmentModule implements CompilerModule {
    private readonly pipeline: Pipeline;

    constructor(pipeline: Pipeline) {
        this.pipeline = pipeline;
    }

    compileFragment?(fragment: Fragment): void {
        const dom: DocumentNode = fragment.dom;

        this.processFragments(dom);
    }

    compilePage?(page: Page): void {
        const dom: DocumentNode = page.dom;

        this.processFragments(dom);
    }

    private processFragments(dom: DocumentNode): void {
        // extract fragments
        const fragmentRefs: FragmentReference[] = this.extractFragmentReferences(dom);

        // replace fragments
        this.replaceFraments(fragmentRefs);
    }

    private extractFragmentReferences(dom: DocumentNode): FragmentReference[] {
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
            const slotContents: SlotContentsMap = this.extractContentsForFragment(node);

            // create reference
            return new FragmentReference(srcResId, node, slotContents); 
        });

        return fragmentReferences;
    }

    private replaceFraments(fragmentRefs: FragmentReference[]): void {
        // process each fragment
        for (const fragment of fragmentRefs) {
            // create usage context
            const usageContext = new UsageContext(fragment.slotContents);

            // call pipeline to load fragment
            const compiledContents: Fragment = this.pipeline.compileFragment(fragment.sourceResId, usageContext);

            // replace with compiled fragment
            fragment.node.replaceSelf(...compiledContents.dom.childNodes)
        }
    }

    private extractContentsForFragment(mFragment: NodeWithChildren): SlotContentsMap {
        const slotMap: SlotContentsMap = new Map();

        // loop through all direct children of fragment reference
        for (const node of Array.from(mFragment.childNodes)) {
            // get content for this slot
            const slotContents: Node[] = this.convertNodeToContent(node);

            // check if it specified a slot
            const slotName: string = this.getContentTargetName(node);

            // get dom for this slot
            const slotDom: DocumentNode = this.getContentDom(slotMap, slotName);

            // add slot contents to new DOM (will automatically detach them)
            slotDom.appendChildren(slotContents);
        }

        return slotMap;
    }

    private getContentDom(slotMap: SlotContentsMap, slotName: string): DocumentNode {
        let slotDom: DocumentNode | undefined = slotMap.get(slotName);

        if (slotDom == undefined) {
            slotDom = new DocumentNode();
            slotMap.set(slotName, slotDom);
        }

        return slotDom;
    }

    private convertNodeToContent(node: Node): Node[] {
        // check if this element is an m-content
        if (TagNode.isTagNode(node) && node.tagName === 'm-content') {
            return node.childNodes;
        } else {
            return [ node ];
        }
    }

    private getContentTargetName(node: Node): string {
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
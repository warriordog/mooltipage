import { Pipeline } from "../pipeline/pipeline";
import { Fragment } from "../pipeline/fragment";
import { Page } from "../pipeline/page";
import { UsageContext } from '../pipeline/usageContext';
import { Node, DocumentNode, TagNode, NodeWithChildren } from '../dom/node';
import { SlotModule } from "./module/slotModule";
import { FragmentModule } from "./module/fragmentModule";

export class HtmlCompiler {
    private readonly pipeline: Pipeline;
    private readonly modules: CompilerModule[];

    constructor(pipeline: Pipeline) {
        this.pipeline = pipeline;

        // these are order-specific!
        // SlotModule needs to run first, as FragmentModule splits up the DOM and would hide <m-slot> tags from SlotModule
        this.modules = [
            new SlotModule(),
            new FragmentModule(pipeline)
        ];
    }

    compileFragment(fragment: Fragment, usageContext: UsageContext): void {
        // get compile data
        // TODO enventually move this to parse phase and enable caching/cloning
        const compileData: CompileData = this.getCompileData(fragment.dom);

        // run modules
        for (const module of this.modules) {
            if (module.compileFragment != undefined) {
                module.compileFragment(fragment, usageContext, compileData);
            }
        }
    }

    compilePage(page: Page): void {
        // get compile data
        // TODO enventually move this to parse phase and enable caching/cloning
        const compileData: CompileData = this.getCompileData(page.dom);

        // run modules
        for (const module of this.modules) {
            if (module.compilePage != undefined) {
                module.compilePage(page, compileData);
            }
        }
    }

    private getCompileData(dom: DocumentNode): CompileData {
        // get slots
        const slots: Slot[] = this.findSlots(dom);

        // get fragments
        const fragmentReferences: FragmentReference[] = this.extractFragmentReferences(dom);

        // create compile data
        const compileData: CompileData = new CompileData(dom, fragmentReferences, slots);

        return compileData;
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

export class CompileData {
    readonly content: DocumentNode;
    readonly fragmentRefs: FragmentReference[];
    readonly slots: Slot[];

    constructor(content: DocumentNode, fragmentRefs: FragmentReference[], slots: Slot[]) {
        this.content = content;
        this.fragmentRefs = fragmentRefs;
        this.slots = slots;
    }
}

export interface CompilerModule {
    compileFragment?(fragment: Fragment, usageContext: UsageContext, compileData: CompileData): void;
    compilePage?(page: Page, compileData: CompileData): void;
}

export type SlotContentsMap = Map<string, DocumentNode>;

export class FragmentReference {
    readonly sourceResId: string;
    readonly slotContents: SlotContentsMap;
    readonly node: TagNode;

    constructor(sourceResId: string, node: TagNode, slotContents: SlotContentsMap) {
        this.sourceResId = sourceResId;
        this.node = node;
        this.slotContents = slotContents;
    }
}

export class Slot {
    readonly name: string;
    readonly isAttribute: boolean;
    readonly node: TagNode;

    constructor(name: string, node: TagNode, isAttribute: boolean) {
        this.name = name;
        this.node = node;
        this.isAttribute = isAttribute;
    }
}
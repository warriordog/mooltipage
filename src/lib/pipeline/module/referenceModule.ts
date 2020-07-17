import { CompilerModule, CompileData } from "../htmlCompiler";
import { Fragment } from "../../pipeline/object/fragment";
import { Node, DocumentNode, MContentNode, NodeWithChildren, ExternalReferenceNode, MFragmentNode, MComponentNode } from "../../dom/node";
import { UsageContext } from "../usageContext";
import { Pipeline } from "../pipeline";

/**
 * Process external references, such as m-fragment and m-component.
 */
export class ReferenceModule implements CompilerModule {

    compileFragment(compileData: CompileData): void {
        // extract references to external html
        const references: ExternalReference[] = this.extractReferences(compileData);

        // replace external references
        this.replaceReferences(compileData, references);
    }

    private extractReferences(compileData: CompileData): ExternalReference[] {
        const dom: DocumentNode = compileData.fragment.dom;

        // get m-fragment references
        const mFragmentRefs = dom.findTopLevelChildTagsByTagName('m-fragment');

        // get m-component references
        const mComponentRefs = dom.findTopLevelChildTagsByTagName('m-component');

        // combine all external references
        const refNodes: ExternalReferenceNode[] = mFragmentRefs.concat(mComponentRefs);
        
        // convert
        return refNodes.map(refNode => {
            // get slot contents
            const slotContents: SlotContentsMap = this.extractSlotContentsFromReference(refNode);

            return {
                refNode: refNode,
                slotContents: slotContents
            };
        })
    }

    private replaceReferences(compileData: CompileData, references: ExternalReference[]): void {
        // process each reference
        for (const ref of references) {
            // create usage context
            const usageContext = compileData.usageContext.createSubContext(ref.slotContents, ref.refNode.parameters);

            // call pipeline to load reference
            const refContents: Fragment = this.compileReference(ref, usageContext, compileData.pipeline);

            // replace with compiled fragment
            ref.refNode.replaceSelf(...refContents.dom.childNodes)
        }
    }

    private compileReference(ref: ExternalReference, usageContext: UsageContext, pipeline: Pipeline): Fragment {
        const src = ref.refNode.src;
        const refTagName = ref.refNode.tagName; // avoid TS bug

        // compile m-fragment as fragment
        if (MFragmentNode.isMFragmentNode(ref.refNode)) {
            return pipeline.compileFragment(src, usageContext);
        }
        
        // compile m-component as component
        if (MComponentNode.isMComponentNode(ref.refNode)) {
            return pipeline.compileComponent(src, usageContext);
        }

        throw new Error(`Unknown external reference type: '${refTagName}'`);
    }

    private extractSlotContentsFromReference(refTag: NodeWithChildren): SlotContentsMap {
        const slotMap: SlotContentsMap = new Map();

        // loop through all direct children of fragment reference
        for (const node of Array.from(refTag.childNodes)) {
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
        if (MContentNode.isMContentNode(node)) {
            return node.childNodes;
        } else {
            return [ node ];
        }
    }

    private getContentTargetName(node: Node): string {
        if (MContentNode.isMContentNode(node)) {
            return node.slot;
        } else {
            return '[default]';
        }
    }
}

type SlotContentsMap = Map<string, DocumentNode>;

interface ExternalReference {
    readonly slotContents: SlotContentsMap;
    readonly refNode: ExternalReferenceNode;
}
import { CompilerModule, CompileData } from "../htmlCompiler";
import { Fragment } from "../../pipeline/object/fragment";
import { Node, DocumentNode, MFragmentNode, MContentNode, ExternalReferenceNode, MComponentNode } from "../../dom/node";
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

        // get all m-fragments and m-component elements
        const mFragments = dom.findChildTagsByTagName('m-fragment');
        const mComponents = dom.findChildTagsByTagName('m-component');
        const referenceTags: ExternalReferenceNode[] = mFragments.concat(mComponents);

        // parse tags
        const externalReferences: ExternalReference[] = referenceTags.map((refTag: ExternalReferenceNode) => {

            // get slot contents
            const slotContents: SlotContentsMap = this.extractSlotContentsFromReference(refTag);

            // create reference
            const externalReference: ExternalReference = {
                slotContents: slotContents,
                tag: refTag
            };

            return externalReference;
        });

        return externalReferences;
    }

    private replaceReferences(compileData: CompileData, references: ExternalReference[]): void {
        // process each reference
        for (const ref of references) {
            // create usage context
            const usageContext = compileData.usageContext.createSubContext(ref.slotContents, ref.tag.parameters);

            // call pipeline to load reference
            const refContents: Fragment = this.compileReference(ref, usageContext, compileData.pipeline);

            // replace with compiled fragment
            ref.tag.replaceSelf(...refContents.dom.childNodes)
        }
    }

    private compileReference(ref: ExternalReference, usageContext: UsageContext, pipeline: Pipeline): Fragment {
        // avoid typescript bug
        const refTag1 = ref.tag;
        const refTag2 = ref.tag;

        // compile m-fragment as fragment
        if (MFragmentNode.isMFragmentNode(refTag1)) {
            return pipeline.compileFragment(refTag1.src, usageContext);
        }
        
        // compile m-component as component
        if (MComponentNode.isMComponentNode(refTag2)) {
            return pipeline.compileComponent(refTag2.src, usageContext);
        }

        throw new Error(`Unknown external reference type: '${ref.tag.tagName}'`);
    }

    private extractSlotContentsFromReference(refTag: ExternalReferenceNode): SlotContentsMap {
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
            return node.slotName;
        } else {
            return '[default]';
        }
    }
}

type SlotContentsMap = Map<string, DocumentNode>;

interface ExternalReference {
    readonly slotContents: SlotContentsMap;
    readonly tag: ExternalReferenceNode;
}
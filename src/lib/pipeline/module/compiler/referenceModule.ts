import { DocumentNode, ExternalReferenceNode, Fragment, UsageContext, Pipeline, MFragmentNode, MComponentNode, NodeWithChildren, Node, MContentNode, HtmlCompilerModule, HtmlCompileData } from "../../..";

/**
 * Process external references, such as m-fragment and m-component.
 */
export class ReferenceModule implements HtmlCompilerModule {

    exitNode(compileData: HtmlCompileData): void {
        if (MFragmentNode.isMFragmentNode(compileData.node) || MComponentNode.isMComponentNode(compileData.node)) {
            this.replaceReference(compileData.node, compileData);
        }
    }

    private replaceReference(refNode: ExternalReferenceNode, compileData: HtmlCompileData): void {
        // get slot contents
        const slotContents: Map<string, DocumentNode> = this.extractSlotContentsFromReference(refNode);

        // create usage context
        const usageContext = compileData.usageContext.createSubContext(slotContents, refNode.parameters);

        // call pipeline to load reference
        const refType = MFragmentNode.isMFragmentNode(refNode) ? 'm-fragment' : 'm-component';
        const refContents: Fragment = this.compileReference(refNode.src, usageContext, compileData.pipeline, refType);

        // replace with compiled fragment
        refNode.replaceSelf(refContents.dom.childNodes);
        compileData.setDeleted();
    }

    private compileReference(src: string, usageContext: UsageContext, pipeline: Pipeline, type: 'm-fragment' | 'm-component'): Fragment {
        switch (type) {
            case 'm-fragment': return pipeline.compileFragment(src, usageContext);
            case 'm-component': return pipeline.compileComponent(src, usageContext);
            default: throw new Error(`Unknown external reference type: '${type}'`); 
        }
    }
    
    private extractSlotContentsFromReference(refTag: NodeWithChildren): Map<string, DocumentNode> {
        const slotMap = new Map<string, DocumentNode>();

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

    private getContentDom(slotMap: Map<string, DocumentNode>, slotName: string): DocumentNode {
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
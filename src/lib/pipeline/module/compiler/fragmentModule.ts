import { HtmlCompilerModule, HtmlCompilerContext } from '../htmlCompiler';
import { MFragmentNode, DocumentNode, Fragment, FragmentContext, Node, MContentNode } from '../../..';
import { createFragmentScope } from '../evalEngine';

/**
 * Resolve <m-fragment> and replace with compiled HTML 
 */
export class FragmentModule implements HtmlCompilerModule {
    exitNode(htmlContext: HtmlCompilerContext): void {
        if (MFragmentNode.isMFragmentNode(htmlContext.node) ) {
            this.replaceFragment(htmlContext.node, htmlContext);
        }
    }

    replaceFragment(fragmentNode: MFragmentNode, htmlContext: HtmlCompilerContext): void {
        // get slot contents
        const slotContents: Map<string, DocumentNode> = this.extractSlotContents(fragmentNode);

        // create usage context
        const fragmentContext: FragmentContext = {
            slotContents: slotContents,
            parameters: fragmentNode.parameters,
            scope: createFragmentScope(fragmentNode.parameters)
        };

        // call pipeline to load reference
        const fragment: Fragment = htmlContext.pipelineContext.pipeline.compileFragment(fragmentNode.src, fragmentContext);

        // replace with compiled fragment
        fragmentNode.replaceSelf(fragment.dom.childNodes);
        htmlContext.setDeleted();
    }
    
    extractSlotContents(fragmentNode: MFragmentNode): Map<string, DocumentNode> {
        const slotMap = new Map<string, DocumentNode>();

        // loop through all direct children of fragment reference
        for (const node of Array.from(fragmentNode.childNodes)) {
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

    getContentDom(slotMap: Map<string, DocumentNode>, slotName: string): DocumentNode {
        let slotDom: DocumentNode | undefined = slotMap.get(slotName);

        if (slotDom == undefined) {
            slotDom = new DocumentNode();
            slotMap.set(slotName, slotDom);
        }

        return slotDom;
    }

    convertNodeToContent(node: Node): Node[] {
        // check if this element is an m-content
        if (MContentNode.isMContentNode(node)) {
            return node.childNodes;
        } else {
            return [ node ];
        }
    }

    getContentTargetName(node: Node): string {
        if (MContentNode.isMContentNode(node)) {
            return node.slot;
        } else {
            return '[default]';
        }
    }
}
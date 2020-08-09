import {HtmlCompilerModule, HtmlCompilerContext, convertAttributeNameToScopeName} from '../htmlCompiler';
import {
    MFragmentNode,
    DocumentNode,
    Fragment,
    FragmentContext,
    Node,
    MContentNode,
    ScopeData,
    SlotReferenceNode
} from '../../..';

/**
 * Resolve <m-fragment> and replace with compiled HTML 
 */
export class FragmentModule implements HtmlCompilerModule {
    exitNode(htmlContext: HtmlCompilerContext): void {
        if (MFragmentNode.isMFragmentNode(htmlContext.node) ) {
            FragmentModule.replaceFragment(htmlContext.node, htmlContext);
        }
    }

    static replaceFragment(mFragment: MFragmentNode, htmlContext: HtmlCompilerContext): void {
        // get slot contents
        const slotContents: Map<string, DocumentNode> = FragmentModule.extractSlotContents(mFragment);

        // create usage context
        const fragmentContext: FragmentContext = {
            slotContents: slotContents,
            scope: FragmentModule.createFragmentScope(mFragment)
        };

        // call pipeline to load reference
        const fragment: Fragment = htmlContext.sharedContext.pipelineContext.pipeline.compileFragment(mFragment.src, fragmentContext);

        // replace with compiled fragment
        mFragment.replaceSelf(fragment.dom.childNodes);
        htmlContext.setDeleted();
    }

    static extractSlotContents(mFragment: MFragmentNode): Map<string, DocumentNode> {
        const slotMap = new Map<string, DocumentNode>();

        // loop through all direct children of fragment reference
        for (const node of Array.from(mFragment.childNodes)) {
            // get content for this slot
            const slotContents: Node[] = FragmentModule.convertNodeToContent(node);

            // check if it specified a slot
            const slotName: string = FragmentModule.getContentTargetName(node);

            // get dom for this slot
            const slotDom: DocumentNode = FragmentModule.getContentDom(slotMap, slotName);

            // add slot contents to new DOM (will automatically detach them)
            slotDom.appendChildren(slotContents);
        }

        return slotMap;
    }

    static getContentDom(slotMap: Map<string, DocumentNode>, slotName: string): DocumentNode {
        let slotDom: DocumentNode | undefined = slotMap.get(slotName);

        if (slotDom == undefined) {
            slotDom = new DocumentNode();
            slotMap.set(slotName, slotDom);
        }

        return slotDom;
    }

    static convertNodeToContent(node: Node): Node[] {
        // check if this element is an m-content
        if (MContentNode.isMContentNode(node)) {
            return node.childNodes;
        } else {
            return [ node ];
        }
    }

    static getContentTargetName(node: Node): string {
        if (MContentNode.isMContentNode(node)) {
            return node.slot;
        } else {
            return SlotReferenceNode.DefaultSlotName;
        }
    }

    static createFragmentScope(fragmentNode: MFragmentNode): ScopeData {
        return fragmentNode.parameters
            // get parameter names
            .map(param => param[0])

            // convert parameter / attribute names to scope names
            .map(parameterName => convertAttributeNameToScopeName(parameterName))

            // copy all data from MFragmentNode scope to new fragment scope
            .reduce((fragmentScope, scopeName) => {
                // copy current parameter from scope prototype chain into an isolated ScopeData
                fragmentScope[scopeName] = fragmentNode.nodeData[scopeName];

                return fragmentScope;
            }, {} as ScopeData);
    }
}
import {HtmlCompilerModule, HtmlCompilerContext} from '../htmlCompiler';
import {
    MFragmentNode,
    DocumentNode,
    FragmentContext,
    Node,
    MContentNode,
    ScopeData,
    SlotReferenceNode
} from '../../..';
import {resolveResPath} from '../../../fs/pathUtils';
import {convertSnakeCaseToCamelCase} from '../../../util/caseUtils';

/**
 * Resolve <m-fragment> and replace with compiled HTML 
 */
export class FragmentModule implements HtmlCompilerModule {
    async exitNode(htmlContext: HtmlCompilerContext): Promise<void> {
        if (MFragmentNode.isMFragmentNode(htmlContext.node) ) {
            await replaceFragment(htmlContext.node, htmlContext);
        }
    }
}

export async function replaceFragment(mFragment: MFragmentNode, htmlContext: HtmlCompilerContext): Promise<void> {
    const pipelineContext = htmlContext.sharedContext.pipelineContext;

    // get slot contents
    const slotContents: Map<string, DocumentNode> = extractSlotContents(mFragment);

    // create usage context
    const parentFragmentContext = pipelineContext.fragmentContext;
    const fragmentContext: FragmentContext = {
        slotContents: slotContents,
        scope: createFragmentScope(mFragment),
        fragmentResPath: mFragment.src,
        rootResPath: parentFragmentContext.rootResPath
    };

    // compute path to fragment
    const fragmentPath = resolveResPath(mFragment.src, pipelineContext.fragment.path);

    // call pipeline to load reference
    const fragment = await pipelineContext.pipeline.compileFragment(fragmentPath, fragmentContext);

    // replace with compiled fragment
    mFragment.replaceSelf(fragment.dom.childNodes);
    htmlContext.setDeleted();
}

export function extractSlotContents(mFragment: MFragmentNode): Map<string, DocumentNode> {
    const slotMap = new Map<string, DocumentNode>();

    // loop through all direct children of fragment reference
    for (const node of Array.from(mFragment.childNodes)) {
        // get content for this slot
        const slotContents: Node[] = convertNodeToContent(node);

        // check if it specified a slot
        const slotName: string = getContentTargetName(node);

        // get dom for this slot
        const slotDom: DocumentNode = getContentDom(slotMap, slotName);

        // add slot contents to new DOM (will automatically detach them)
        slotDom.appendChildren(slotContents);
    }

    return slotMap;
}

export function getContentDom(slotMap: Map<string, DocumentNode>, slotName: string): DocumentNode {
    let slotDom: DocumentNode | undefined = slotMap.get(slotName);

    if (slotDom === undefined) {
        slotDom = new DocumentNode();
        slotMap.set(slotName, slotDom);
    }

    return slotDom;
}

export function convertNodeToContent(node: Node): Node[] {
    // check if this element is an m-content
    if (MContentNode.isMContentNode(node)) {
        return node.childNodes;
    } else {
        return [ node ];
    }
}

export function getContentTargetName(node: Node): string {
    if (MContentNode.isMContentNode(node)) {
        return node.slot;
    } else {
        return SlotReferenceNode.DefaultSlotName;
    }
}

export function createFragmentScope(fragmentNode: MFragmentNode): ScopeData {
    return fragmentNode.parameters
        // get parameter names
        .map(param => param[0])

        // convert parameter / attribute names to scope names
        .map(parameterName => convertSnakeCaseToCamelCase(parameterName))

        // copy all data from MFragmentNode scope to new fragment scope
        .reduce<ScopeData>((fragmentScope, scopeName) => {
            // copy current parameter from scope prototype chain into an isolated ScopeData
            fragmentScope[scopeName] = fragmentNode.nodeData[scopeName];

            return fragmentScope;
        }, {});
}
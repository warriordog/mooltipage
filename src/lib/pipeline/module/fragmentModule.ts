import { CompilerModule, CompileData } from "../htmlCompiler";
import { Fragment } from "../../pipeline/object/fragment";
import { UsageContext } from "../../pipeline/usageContext";
import { Node, DocumentNode, TagNode, NodeWithChildren } from "../../dom/node";
import { EvalVars, EvalContext } from "../evalEngine";

export class FragmentModule implements CompilerModule {

    compileFragment(compileData: CompileData): void {
        // extract fragments
        const fragmentRefs: FragmentReference[] = this.extractFragmentReferences(compileData, compileData.createEvalContext());

        // replace fragments
        this.replaceFraments(compileData, fragmentRefs);
    }

    private extractFragmentReferences(compileData: CompileData, evalContext: EvalContext): FragmentReference[] {
        const dom: DocumentNode = compileData.fragment.dom;

        // get all non-nested m-fragment elements
        const fragments: TagNode[] = dom.findTopLevelChildTags((tag: TagNode) => tag.tagName === 'm-fragment');

        // create eval context

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

            // get params
            const fragmentParams: EvalVars = this.getFragmentParams(compileData, node, evalContext);

            // create reference
            const fragmentRef: FragmentReference = {
                sourceResId: srcResId,
                slotContents: slotContents,
                fragmentParams: fragmentParams,
                node: node
            };

            return fragmentRef;
        });

        return fragmentReferences;
    }

    private replaceFraments(compileData: CompileData, fragmentRefs: FragmentReference[]): void {
        // process each fragment
        for (const fragment of fragmentRefs) {
            // create usage context
            const usageContext = new UsageContext(false, fragment.slotContents, fragment.fragmentParams);

            // call pipeline to load fragment
            const compiledContents: Fragment = compileData.pipeline.compileFragment(fragment.sourceResId, usageContext);

            // replace with compiled fragment
            fragment.node.replaceSelf(...compiledContents.dom.childNodes)
        }
    }

    private getFragmentParams(compileData: CompileData, node: TagNode, evalContext: EvalContext): EvalVars {
        const evalVars: EvalVars = new Map();

        for (const attribute of node.attributes) {
            const name: string = attribute[0];

            // skip src attribute - it is reserved for m-fragment itself
            if (name !== 'src') {
                const attrValue: string | null = attribute[1];

                // compile the text, either as JS or as text
                const paramValue = compileData.pipeline.compileDomText(attrValue, evalContext);

                // set it as a param
                evalVars.set(name, paramValue);
            }
        }

        return evalVars;
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

interface FragmentReference {
    readonly sourceResId: string;
    readonly slotContents: SlotContentsMap;
    readonly fragmentParams: EvalVars;
    readonly node: TagNode;
}
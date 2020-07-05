import { CompilerModule, CompileData } from "../htmlCompiler";
import { Fragment } from "../../pipeline/object/fragment";
import { Node, DocumentNode, TagNode, NodeWithChildren } from "../../dom/node";
import { EvalVars, EvalContext } from "../evalEngine";
import { UsageContext } from "../usageContext";
import { Pipeline } from "../pipeline";

/**
 * Process external references, such as m-fragment and m-component.
 */
export class ReferenceModule implements CompilerModule {

    compileFragment(compileData: CompileData): void {
        // create eval context
        const evalContext: EvalContext = compileData.createEvalContext();

        // extract references to external html
        const references: ExternalReference[] = this.extractReferences(compileData, evalContext);

        // replace external references
        this.replaceReferences(compileData, references);
    }

    private extractReferences(compileData: CompileData, evalContext: EvalContext): ExternalReference[] {
        const dom: DocumentNode = compileData.fragment.dom;

        // get all non-nested m-fragments and m-component elements
        const referenceTags: TagNode[] = dom.findTopLevelChildTags((tag: TagNode) => tag.tagName === 'm-fragment' || tag.tagName === 'm-component');

        // parse tags
        const externalReferences: ExternalReference[] = referenceTags.map((tag: TagNode) => {
            // get source
            const srcResId: string | undefined = tag.attributes.get('src') ?? undefined;
            if (srcResId == null) {
                throw new Error(`${tag.tagName} is missing required attribute: src`);
            }

            // get slot contents
            const slotContents: SlotContentsMap = this.extractSlotContentsFromReference(tag);

            // get params
            const parameters: EvalVars = this.getParameters(compileData, tag, evalContext);

            // create reference
            const externalReference: ExternalReference = {
                sourceResId: srcResId,
                slotContents: slotContents,
                parameters: parameters,
                tag: tag
            };

            return externalReference;
        });

        return externalReferences;
    }

    private replaceReferences(compileData: CompileData, references: ExternalReference[]): void {
        // process each reference
        for (const ref of references) {
            // create usage context
            const usageContext = compileData.usageContext.createSubContext(ref.slotContents, ref.parameters);

            // call pipeline to load reference
            const refContents: Fragment = this.compileReference(ref, usageContext, compileData.pipeline);

            // replace with compiled fragment
            ref.tag.replaceSelf(...refContents.dom.childNodes)
        }
    }

    private compileReference(ref: ExternalReference, usageContext: UsageContext, pipeline: Pipeline): Fragment {
        const refType: string = ref.tag.tagName;

        if (refType === 'm-fragment') {

            // compile m-fragment as fragment
            return pipeline.compileFragment(ref.sourceResId, usageContext);
        } else if (refType === 'm-component') {

            // compile m-component as component
            return pipeline.compileComponent(ref.sourceResId, usageContext);
        } else {
            throw new Error(`Unknown external reference type: '${refType}'`);
        }
    }

    private getParameters(compileData: CompileData, tag: TagNode, evalContext: EvalContext): EvalVars {
        const evalVars: EvalVars = new Map();

        for (const attribute of tag.attributes) {
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

    private extractSlotContentsFromReference(mFragment: NodeWithChildren): SlotContentsMap {
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

interface ExternalReference {
    readonly sourceResId: string;
    readonly slotContents: SlotContentsMap;
    readonly parameters: EvalVars;
    readonly tag: TagNode;
}
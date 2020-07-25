import { ExternalReferenceNode, HtmlCompileData, MImportNode, TagNode, MComponentNode, MFragmentNode, HtmlCompilerModule, Node, ImportDefinition } from "../../..";

/**
 * Process imports / aliases via m-import
 */
export class ImportsModule implements HtmlCompilerModule {
    enterNode(node: Node, compileData: HtmlCompileData): void {
        
        if (MImportNode.isMImportNode(node)) {
            // if this is m-import, then process it
            this.registerImport(node, compileData);

        } else if (TagNode.isTagNode(node) && compileData.hasImport(node.tagName)) {
            // else if this is a replacement node, then replace it
            this.replaceImport(node, compileData);
        }
    }

    private registerImport(mImport: MImportNode, compileData: HtmlCompileData): void {
        // imports are registered into the parent scope. Fall back to current scope in case this is the root
        const targetNodeData = compileData.parentData ?? compileData;

        // create import definition and register in compile data
        targetNodeData.defineImport({
            alias: mImport.as,
            source: mImport.src,
            type: mImport.fragment ? 'm-fragment' : 'm-component'
        });

        // delete node
        mImport.removeSelf();
    }

    private replaceImport(tag: TagNode, nodeCompileData: HtmlCompileData): void {
        // get import definition
        const importDefinition = nodeCompileData.getImport(tag.tagName);

        // create replacement
        const replacementTag = this.createReplacementTag(tag, importDefinition);

        // replace tag
        replacementTag.appendChildren(tag.childNodes);
        tag.replaceSelf([ replacementTag ]);
    }

    private createReplacementTag(tag: TagNode, importDefinition: ImportDefinition): ExternalReferenceNode {
        // clone attributes to give to replacement
        const attributes = new Map(tag.getAttributes().entries());

        // clone tag
        switch (importDefinition.type) {
            case 'm-fragment': return new MFragmentNode(importDefinition.source, attributes);
            case 'm-component': return new MComponentNode(importDefinition.source, attributes);
            default: throw new Error(`Unknown import definition type: ${importDefinition.type}`);
        }
    }
}
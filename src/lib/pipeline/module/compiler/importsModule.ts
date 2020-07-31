import { ExternalReferenceNode, HtmlCompilerContext, MImportNode, TagNode, MComponentNode, MFragmentNode, HtmlCompilerModule, ImportDefinition } from '../../..';

/**
 * Process imports / aliases via m-import
 */
export class ImportsModule implements HtmlCompilerModule {
    enterNode(htmlContext: HtmlCompilerContext): void {
        
        if (MImportNode.isMImportNode(htmlContext.node)) {
            // if this is m-import, then process it
            this.registerImport(htmlContext.node, htmlContext);

        } else if (TagNode.isTagNode(htmlContext.node) && htmlContext.hasImport(htmlContext.node.tagName)) {
            // else if this is a replacement node, then replace it
            this.replaceImport(htmlContext.node, htmlContext);
        }
    }

    private registerImport(mImport: MImportNode, htmlContext: HtmlCompilerContext): void {
        // imports are registered into the parent scope. Fall back to current scope in case this is the root
        const targetNodeData = htmlContext.parentContext ?? htmlContext;

        // create import definition and register in compile data
        targetNodeData.defineImport({
            alias: mImport.as,
            source: mImport.src,
            type: mImport.type
        });

        // delete node
        mImport.removeSelf();
        htmlContext.setDeleted();
    }

    private replaceImport(tag: TagNode, htmlContext: HtmlCompilerContext): void {
        // get import definition
        const importDefinition = htmlContext.getImport(tag.tagName);

        // create replacement
        const replacementTag = this.createReplacementTag(tag, importDefinition);

        // replace tag
        replacementTag.appendChildren(tag.childNodes);
        tag.replaceSelf([ replacementTag ]);
        htmlContext.setDeleted();
    }

    private createReplacementTag(tag: TagNode, importDefinition: ImportDefinition): ExternalReferenceNode {
        // clone attributes to give to replacement
        const attributes = new Map(tag.getAttributes().entries());

        // clone tag
        switch (importDefinition.type) {
            case 'm-fragment': return new MFragmentNode(importDefinition.source, attributes);
            case 'm-component': return new MComponentNode(importDefinition.source, attributes);
            default: throw new Error(`Unknown import definition type: ${ importDefinition.type }`);
        }
    }
}
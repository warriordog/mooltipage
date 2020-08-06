import {HtmlCompilerContext, HtmlCompilerModule} from '../htmlCompiler';
import { DocumentNode, MDataNode, MDataNodeRef, MimeType, MScopeNode, MVarNode, Node, ScopeData, TagNode } from '../../..';

/**
 * Compile module that implements <m-var> and <m-scope> parsing
 */
export class VarModule implements HtmlCompilerModule {
    enterNode(htmlContext: HtmlCompilerContext): void {
        if (DocumentNode.isDocumentNode(htmlContext.node)) {
            // if document, then bind root scope and we are done
            htmlContext.node.setRootScope(htmlContext.pipelineContext.fragmentContext.scope);

        } else if (MVarNode.isMVarNode(htmlContext.node)) {
            // process m-var
            VarModule.evalVar(htmlContext.node, htmlContext, true);

            // delete when done
            htmlContext.node.removeSelf();
            htmlContext.setDeleted();

        } else if (MScopeNode.isMScopeNode(htmlContext.node)) {
            // process m-scope, but leave until later to cleanup
            VarModule.evalVar(htmlContext.node, htmlContext, false);

        } else if (MDataNode.isMDataNode(htmlContext.node)) {
            // process <m-data>
            VarModule.processMData(htmlContext.node, htmlContext);

        }
    }

    exitNode(htmlContext: HtmlCompilerContext): void {
        // m-scope removal is delayed until now to preserve the scope data
        if (MScopeNode.isMScopeNode(htmlContext.node)) {
            // delete node, but leave children in place
            htmlContext.node.removeSelf(true);
            htmlContext.setDeleted();
        }
    }

    private static evalVar(node: TagNode, htmlContext: HtmlCompilerContext, useParentScope: boolean) {
        // m-var writes into its parent's scope instead of using its own
        const targetScope = VarModule.getTargetScope(node, htmlContext, useParentScope);

        // this should not happen, but if there is ever not a parent then this var is a no-op and can be skipped
        if (targetScope != undefined) {

            // promote variables to scope
            for (const variable of node.getAttributes().entries()) {
                // assign value
                targetScope[variable[0]] = variable[1];
            }
        }
    }

    private static processMData(node: MDataNode, htmlContext: HtmlCompilerContext): void {
        // get target scope - this writes into the containing scope rather than its own
        const targetScope = VarModule.getTargetScope(node, htmlContext, true);

        // process each reference
        for (const reference of node.references) {
            // compile content and bind to scope
            targetScope[reference.varName] = VarModule.compileReference(reference, node, htmlContext);
        }

        // delete node
        node.removeSelf();
        htmlContext.setDeleted();
    }

    private static compileReference(reference: MDataNodeRef, node: MDataNode, htmlContext: HtmlCompilerContext): unknown {
        // get value
        const rawValue = htmlContext.pipelineContext.pipeline.getRawText(reference.resPath, node.type);

        // parse as correct type
        switch (node.type) {
            case MimeType.JSON:
                // JSON data
                return JSON.parse(rawValue);
            case MimeType.TEXT:
                // text data
                return String(rawValue);
            default:
                // pass unknown types as-is
                return rawValue;
        }
    }

    private static getTargetScope(node: Node, htmlContext: HtmlCompilerContext, useParentScope: boolean): ScopeData {
        // if not using the parent scope, then we can take current node's data and use that as scope
        if (!useParentScope) {
            return node.nodeData;
        }

        // if we are using the parent scope and there is a parent node, then use that scope
        if (node.parentNode != null) {
            return node.parentNode.nodeData;
        }

        // if we are using the parent scope but there is no parent node, then fall back to root scope
        return htmlContext.pipelineContext.fragmentContext.scope;
    }
}
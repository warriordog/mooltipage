import {convertAttributeNameToScopeName, HtmlCompilerContext, HtmlCompilerModule} from '../htmlCompiler';
import {
    DocumentNode,
    MDataNode,
    MDataNodeRef, MFragmentNode,
    MimeType,
    MScopeNode,
    MVarNode,
    Node,
    ScopeData,
    TagNode
} from '../../..';

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
            VarModule.bindAttributeDataToScope(htmlContext.node, htmlContext, true, htmlContext.node.getAttributes().entries());

            // delete when done
            htmlContext.node.removeSelf();
            htmlContext.setDeleted();

        } else if (MScopeNode.isMScopeNode(htmlContext.node)) {
            // process m-scope, but leave until later to cleanup
            VarModule.bindAttributeDataToScope(htmlContext.node, htmlContext, false, htmlContext.node.getAttributes().entries());

        } else if (MDataNode.isMDataNode(htmlContext.node)) {
            // process m-data
            VarModule.processMData(htmlContext.node, htmlContext);

        } else if (MFragmentNode.isMFragmentNode(htmlContext.node)) {
            // process m-fragment
            VarModule.bindAttributeDataToScope(htmlContext.node, htmlContext, false, htmlContext.node.parameters);
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

    private static bindAttributeDataToScope(node: TagNode, htmlContext: HtmlCompilerContext, useParentScope: boolean, attributes: Iterable<[string, unknown]>) {
        // m-var writes into its parent's scope instead of using its own
        const targetScope = VarModule.getTargetScope(node, htmlContext, useParentScope);

        // promote variables to scope
        for (const variable of attributes) {
            // copy value to scope
            VarModule.saveCompiledAttributeToScope(targetScope, variable[0], variable[1]);
        }
    }

    private static processMData(node: MDataNode, htmlContext: HtmlCompilerContext): void {
        // get target scope - this writes into the containing scope rather than its own
        const targetScope = VarModule.getTargetScope(node, htmlContext, true);

        // process each reference
        for (const reference of node.references) {
            // compile content
            const compiledContent: unknown = VarModule.compileReference(reference, node, htmlContext);

            // bind to scope
            VarModule.saveCompiledAttributeToScope(targetScope, reference.varName, compiledContent);
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

    /**
     * Binds a compiled data attribute to a scope object.
     * Performs case-conversion on the attribute name
     *
     * @param scope Scope object to save to
     * @param attributeName Attribute name
     * @param compiledValue Value of the attribute
     */
    public static saveCompiledAttributeToScope(scope: ScopeData, attributeName: string, compiledValue: unknown): void {
        // convert snake-case attribute name to camelCase scope name
        const scopeName: string = convertAttributeNameToScopeName(attributeName);

        // save to scope
        scope[scopeName] = compiledValue;
    }
}
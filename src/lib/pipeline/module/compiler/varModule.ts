import {HtmlCompilerContext, HtmlCompilerModule} from '../htmlCompiler';
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
import {resolveResPath} from '../../../fs/pathUtils';
import {convertSnakeCaseToCamelCase} from '../../../util/caseUtils';

/**
 * Compile module that implements <m-var> and <m-scope> parsing
 */
export class VarModule implements HtmlCompilerModule {
    async enterNode(htmlContext: HtmlCompilerContext): Promise<void> {
        if (DocumentNode.isDocumentNode(htmlContext.node)) {
            // if document, then bind root scope and we are done
            htmlContext.node.setRootScope(htmlContext.pipelineContext.fragmentContext.scope);

        } else if (MVarNode.isMVarNode(htmlContext.node)) {
            // process m-var
            bindAttributeDataToScope(htmlContext.node, htmlContext, true, htmlContext.node.getAttributes().entries());

            // delete when done
            htmlContext.node.removeSelf();
            htmlContext.setDeleted();

        } else if (MScopeNode.isMScopeNode(htmlContext.node)) {
            // process m-scope, but leave until later to cleanup
            bindAttributeDataToScope(htmlContext.node, htmlContext, false, htmlContext.node.getAttributes().entries());

        } else if (MDataNode.isMDataNode(htmlContext.node)) {
            // process m-data
            await processMData(htmlContext.node, htmlContext);

        } else if (MFragmentNode.isMFragmentNode(htmlContext.node)) {
            // process m-fragment
            bindAttributeDataToScope(htmlContext.node, htmlContext, false, htmlContext.node.parameters);
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
}


export function bindAttributeDataToScope(node: TagNode, htmlContext: HtmlCompilerContext, useParentScope: boolean, attributes: Iterable<[string, unknown]>): void {
    // m-var writes into its parent's scope instead of using its own
    const targetScope = getTargetScope(node, htmlContext, useParentScope);

    // promote variables to scope
    for (const variable of attributes) {
        // copy value to scope
        saveCompiledAttributeToScope(targetScope, variable[0], variable[1]);
    }
}

export async function processMData(node: MDataNode, htmlContext: HtmlCompilerContext): Promise<void> {
    // get target scope - this writes into the containing scope rather than its own
    const targetScope = getTargetScope(node, htmlContext, true);

    // process each reference
    for (const reference of node.references) {
        // compile content
        const compiledContent: unknown = await compileReference(reference, node, htmlContext);

        // bind to scope
        saveCompiledAttributeToScope(targetScope, reference.varName, compiledContent);
    }

    // delete node
    node.removeSelf();
    htmlContext.setDeleted();
}

export async function compileReference(reference: MDataNodeRef, node: MDataNode, htmlContext: HtmlCompilerContext): Promise<unknown> {
    const pipelineContext = htmlContext.pipelineContext;

    // compute path to reference
    const resPath = resolveResPath(reference.resPath, pipelineContext.fragment.path);

    // get value
    const rawValue = await pipelineContext.pipeline.getRawText(resPath, node.type);

    // parse as correct type
    switch (node.type) {
        case MimeType.JSON:
            // JSON data
            return JSON.parse(rawValue) as unknown;
        case MimeType.TEXT:
            // text data
            return String(rawValue);
        default:
            // pass unknown types as-is
            return rawValue;
    }
}

export function getTargetScope(node: Node, htmlContext: HtmlCompilerContext, useParentScope: boolean): ScopeData {
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
export function saveCompiledAttributeToScope(scope: ScopeData, attributeName: string, compiledValue: unknown): void {
    // convert snake-case attribute name to camelCase scope name
    const scopeName: string = convertSnakeCaseToCamelCase(attributeName);

    // save to scope
    scope[scopeName] = compiledValue;
}
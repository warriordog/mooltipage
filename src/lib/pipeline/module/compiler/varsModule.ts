import { HtmlCompilerContext, MVarNode, MScopeNode, HtmlCompilerModule, DocumentNode, EvalScope } from '../../..';

/**
 * Compile module that implements <m-var> and <m-scope> parsing
 */
export class VarsModule implements HtmlCompilerModule {
    enterNode(htmlContext: HtmlCompilerContext): void {
        if (DocumentNode.isDocumentNode(htmlContext.node)) {
            // if document, then bind root scope and we are done
            htmlContext.node.setRootScope(htmlContext.pipelineContext.rootScope);

        } else if (MVarNode.isMVarNode(htmlContext.node)) {
            // process m-var
            this.evalVar(htmlContext.node, htmlContext, true);

            // delete when done
            htmlContext.node.removeSelf();
            htmlContext.setDeleted();

        } else if (MScopeNode.isMScopeNode(htmlContext.node)) {
            // process m-scope, but leave until later to cleanup
            this.evalVar(htmlContext.node, htmlContext, false);
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

    private evalVar(node: VariablesNode, htmlContext: HtmlCompilerContext, useParentScope: boolean) {
        // m-var writes into its parent's scope instead of using its own
        const targetScope = this.getTargetScope(node, htmlContext, useParentScope);

        // this should not happen, but if there is ever not a parent then this var is a no-op and can be skipped
        if (targetScope != undefined) {

            // promote variables to scope
            for (const variable of node.getAttributes().entries()) {
                const varName: string = variable[0];
                const srcValue: unknown = variable[1];

                // assign value
                targetScope[varName] = srcValue;
            }
        }
    }

    private getTargetScope(node: VariablesNode, htmlContext: HtmlCompilerContext, useParentScope: boolean): EvalScope {
        // if not using the parent scope, then we can take current node's data and use that as scope
        if (!useParentScope) {
            return node.nodeData;
        }

        // if we are using the parent scope and there is a parent node, then use that scope
        if (node.parentNode != null) {
            return node.parentNode.nodeData;
        }

        // if we are using the parent scope but there is no parent node, then fall back to root scope
        return htmlContext.pipelineContext.rootScope;
    }
}

/**
 * Union type for all nodes containing variables
 */
type VariablesNode = MVarNode | MScopeNode;
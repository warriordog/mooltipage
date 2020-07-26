import { HtmlCompileData, MVarNode, MScopeNode, HtmlCompilerModule, DocumentNode, EvalScope } from "../../..";

/**
 * Compile module that implements <m-var> and <m-scope> parsing
 */
export class VarsModule implements HtmlCompilerModule {
    enterNode(compileData: HtmlCompileData): void {
        if (DocumentNode.isDocumentNode(compileData.node)) {
            // if document, then bind root scope and we are done
            this.setRootScope(compileData.node, compileData);

        } else if (MVarNode.isMVarNode(compileData.node)) {
            // process m-var
            this.evalVar(compileData.node, compileData, true);

            // delete when done
            compileData.node.removeSelf();
            compileData.setDeleted();

        } else if (MScopeNode.isMScopeNode(compileData.node)) {
            // process m-scope, but leave until later to cleanup
            this.evalVar(compileData.node, compileData, false);
        }
    }

    exitNode(compileData: HtmlCompileData): void {
        // m-scope removal is delayed until now to preserve the scope data
        if (MScopeNode.isMScopeNode(compileData.node)) {
            // delete node, but leave children in place
            compileData.node.removeSelf(true);
            compileData.setDeleted();
        }
    }

    private setRootScope(dom: DocumentNode, compileData: HtmlCompileData): void {
        // bind DOM scope to fragment root scope
        dom.setRootScope(compileData.usageContext.rootScope);
    }

    private evalVar(node: VariablesNode, compileData: HtmlCompileData, useParentScope: boolean) {
        // m-var writes into its parent's scope instead of using its own
        const targetScope = this.getTargetScope(node, compileData, useParentScope);

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

    private getTargetScope(node: VariablesNode, compileData: HtmlCompileData, useParentScope: boolean): EvalScope {
        // if not using the parent scope, then we can take current node's data and use that as scope
        if (!useParentScope) {
            return node.nodeData;
        }

        // if we are using the parent scope and there is a parent node, then use that scope
        if (node.parentNode != null) {
            return node.parentNode.nodeData;
        }

        // if we are using the parent scope but there is no parent node, then fall back to root scope
        return compileData.usageContext.rootScope;
    }
}

/**
 * Union type for all nodes containing variables
 */
type VariablesNode = MVarNode | MScopeNode;
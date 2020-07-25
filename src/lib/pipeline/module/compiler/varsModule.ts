import { HtmlCompileData, MVarNode, MScopeNode, VariablesNode, HtmlCompilerModule, Node, DocumentNode, EvalScope } from "../../..";

/**
 * Compile module that implements <m-var> and <m-scope> parsing
 */
export class VarsModule implements HtmlCompilerModule {
    enterNode(node: Node, compileData: HtmlCompileData): void {
        if (DocumentNode.isDocumentNode(node)) {
            // if document, then bind root scope and we are done
            this.setRootScope(node, compileData);
        } else if (MVarNode.isMVarNode(node)) {
            // process m-var, then remove
            this.evalVar(node, compileData, true);
            node.removeSelf();
        } else if (MScopeNode.isMScopeNode(node)) {
            // process m-scope, but leave until later to cleanup
            this.evalVar(node, compileData, false);
        }
    }

    exitNode(node: Node): void {
        // m-scope removal is delayed until now to preserve the scope data
        if (MScopeNode.isMScopeNode(node)) {
            // leave children in place
            node.removeSelf(true);
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
            for (const variable of node.variables.entries()) {
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
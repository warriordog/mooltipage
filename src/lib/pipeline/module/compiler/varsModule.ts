import { CompilerModule, CompileData, MVarNode, EvalScopeObject, Node, NodeWithChildren, MScopeNode, VariablesNode } from "../../..";
import { EvalContext } from "../evalEngine";

/**
 * Compile module that implements <m-var> and <m-scope> parsing
 */
export class VarsModule implements CompilerModule {
    compileFragment(compileData: CompileData): void {
        // create and assign scopes
        this.createScopes(compileData);

        // evaluate m-var and m-scope variables
        this.evalVars(compileData);
    }

    private createScopes(compileData: CompileData) {
        // root eval scope
        const rootScope = compileData.usageContext.rootScope.createChildScope();

        // create and assign scopes for all nodes
        this.createScopeFor(compileData.fragment.dom, rootScope);
    }

    private createScopeFor(node: Node, currentScope: EvalScopeObject): void {
        // if this is a scoping tag, then create a new scope
        if (node.isScoping) {
            currentScope = currentScope.createChildScope();
        }

        // set scope for node
        node.evalScope = currentScope;

        // process child nodes
        if (NodeWithChildren.isNodeWithChildren(node)) {
            for (const childNode of node.childNodes) {
                this.createScopeFor(childNode, currentScope);
            }
        }
    }
    
    private evalVars(compileData: CompileData) {
        // find all vars and scopes
        const varElems: MVarNode[] = compileData.fragment.dom.findChildTagsByTagName('m-var');
        const scopeElems: MScopeNode[] = compileData.fragment.dom.findChildTagsByTagName('m-scope');
        
        // compute values
        this.getVarValues(compileData, varElems);
        this.getVarValues(compileData, scopeElems);

        // remove from DOM
        this.removeVarElems(varElems);
        this.removeMScopes(scopeElems);
    }

    private getVarValues(compileData: CompileData, varNodes: VariablesNode[]): void {
        for (const mVar of varNodes) {
            // create eval context
            const evalContext = compileData.createEvalContext(mVar.evalScope);

            for (const variable of mVar.variables.entries()) {
                const varName: string = variable[0];
                const srcValue: unknown = variable[1];

                // compute real value
                const varValue = this.getAttributeValue(srcValue, compileData, evalContext);

                // assign value
                evalContext.scope.scopeData[varName] = varValue;
            }
        }
    }

    private getAttributeValue(srcValue: unknown, compileData: CompileData, evalContext: EvalContext): unknown {
        if (typeof(srcValue) === 'string') {
            return compileData.pipeline.compileDomText(srcValue, evalContext);
        } else {
            return srcValue;
        }
    }

    private removeVarElems(mVars: MVarNode[]): void {
        for (const mVar of mVars) {
            // remove each m-var and children
            mVar.removeSelf();
        }
    }

    private removeMScopes(mScopes: MScopeNode[]): void {
        for (const mScope of mScopes) {
            // remove each m-scope, but keep children
            mScope.removeSelf(true);
        }
    }
}
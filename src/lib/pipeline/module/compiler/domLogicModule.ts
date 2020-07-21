import { CompilerModule, CompileData, MIfNode, Node, NodeWithChildren } from "../../..";

/**
 * Process dom logic: m-if, m-for, etc.
 */
export class DomLogicModule implements CompilerModule {
    compileFragment(compileData: CompileData): void {
        // walk dom
        this.walkDomAt(compileData.fragment.dom, compileData);
    }

    private walkDomAt(node: Node, compileData: CompileData): void {
        if (MIfNode.isMIfNode(node)) {
            // process m-if nodes
            this.compileMIf(node, compileData);
        } else {
            // process non-logic nodes
            this.compileGenericNode(node, compileData);
        }
    }

    private compileMIf(mIf: MIfNode, compileData: CompileData): void {
        // compile expression
        const evalContext = compileData.createEvalContext(mIf.evalScope);
        const expressionResult = compileData.pipeline.compileDomText(mIf.expression, evalContext);
        const isTrue = !!expressionResult;

        if (isTrue) {
            // if the expression is true, then process children
            this.processChildren(mIf, compileData);

            // remove self, but keep children
            mIf.removeSelf(true);
        } else {
            // if the expression is false, then remove self and children
            mIf.removeSelf(false);
        }
    }
    
    private compileGenericNode(node: Node, compileData: CompileData): void {
        // process children (children and siblings are already updated by this point)
        if (NodeWithChildren.isNodeWithChildren(node)) {
            this.processChildren(node, compileData);
        }
    }

    private processChildren(node: NodeWithChildren, compileData: CompileData): void {
        // do a linked search instead of array iteration, because the child list can be modified (such as by m-for)
        let currentChild: Node | null = node.firstChild;
        while (currentChild != null) {
            // save the next sibling, in case the child deletes itself (m-if / similar)
            const nextChild: Node | null = currentChild.nextSibling;

            // process the child
            this.walkDomAt(currentChild, compileData);

            // move on to next. conditional logic will never modify a previous node, so as long as we only check nextSibling we will get them all.
            // if the node removes itself, nextSibling will be null so we need to skip to the saved next child.
            currentChild = currentChild.nextSibling ?? nextChild;
        }
    }
}
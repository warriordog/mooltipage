import { MIfNode, Node, MForNode, HtmlCompilerModule, DocumentNode, MScopeNode, MForOfNode, MForInNode } from "../../..";

/**
 * Process dom logic: m-if, m-for, etc.
 */
export class DomLogicModule implements HtmlCompilerModule {
    enterNode(node: Node): void {
        if (MIfNode.isMIfNode(node)) {
            // process m-if nodes
            node.removeSelf(node.condition);
        } else if (MForNode.isMForNode(node)) {
            // process m-for nodes
            this.compileMFor(node);
        }
    }

    private compileMFor(mFor: MForNode): void {
        // extract contents
        const forContents: DocumentNode = mFor.createDomFromChildren();

        // generate iteration data for the loop. This will be in order.
        const iterations: MForIteration[] = this.evaluateMFor(mFor);

        // append iterations
        // This has to go in reverse, since we are effecively inserting at the head of a linked list each time
        for (let i = iterations.length - 1; i >= 0; i--) {
            const iteration = iterations[i];
            this.compileIteration(mFor, iteration, forContents);
        }

        // remove m-for after processing
        mFor.removeSelf();
    }

    private evaluateMFor(mFor: MForNode): MForIteration[] {
        if (MForOfNode.isMForOfNode(mFor)) {
            return this.evaluateForOf(mFor.value);
        } else if (MForInNode.isMForInNode(mFor)) {
            return this.evaluateForIn(mFor.value);
        } else {
            throw new Error('m-for node is neither a for...of nor a for...in loop');
        }
    }

    private evaluateForOf(ofValue: unknown): MForIteration[] {
        const iterations: MForIteration[] = [];

        // get the compiled of expression as an array
        const arrayValue = ofValue as unknown[];
        
        // make sure that it actually is an array
        if (arrayValue != undefined && typeof(arrayValue.length) === 'number') {
            let index = 0;
            for (const value of arrayValue) {
                iterations.push({
                    value: value,
                    index: index
                });

                index++;
            }
        }

        return iterations;
    }

    private evaluateForIn(inValue: unknown): MForIteration[] {
        const iterations: MForIteration[] = [];
        
        // make sure that it actually is an object
        if (inValue != undefined && typeof(inValue) === 'object') {
            let index = 0;
            for (const value in inValue) {
                iterations.push({
                    value: value,
                    index: index
                });

                index++;
            }
        }

        return iterations;
    }

    private compileIteration(mFor: MForNode, iteration: MForIteration, forContents: DocumentNode): void {
        // create scope
        const mScope = new MScopeNode();
    
        // bind value var
        mScope.setRawAttribute(mFor.varName, iteration.value);

        // bind index var, if included
        if (mFor.indexName != undefined) {
            mScope.setRawAttribute(mFor.indexName, iteration.index);
        }

        // append copy of children
        const forContentsClone = forContents.clone(true);
        mScope.appendChildren(forContentsClone.childNodes);

        // append to m-for node
        mFor.appendSibling(mScope);
    }

    
}

interface MForIteration {
    value: unknown;
    index: number;
}

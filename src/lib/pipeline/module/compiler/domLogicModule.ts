import { MIfNode, MElseIfNode, MElseNode, HtmlCompilerContext, MForNode, HtmlCompilerModule, DocumentNode, MScopeNode, MForOfNode, MForInNode, ConditionalNode } from '../../..';

/**
 * Process dom logic: m-if, m-for, etc.
 */
export class DomLogicModule implements HtmlCompilerModule {
    enterNode(htmlContext: HtmlCompilerContext): void {
        if (MIfNode.isMIfNode(htmlContext.node) || MElseIfNode.isMElseIfNode(htmlContext.node) || MElseNode.isMElseNode(htmlContext.node)) {
            // process conditional nodes
            this.compileConditional(htmlContext.node, htmlContext);
        
        } else if (MForNode.isMForNode(htmlContext.node)) {
            // process m-for nodes
            this.compileMFor(htmlContext.node, htmlContext);
        }
    }

    private compileConditional(conditional: ConditionalNode, htmlContext: HtmlCompilerContext): void {
        // if conditional is true, then delete rest of conditional train and promote children
        if (conditional.isTruthy) {
            this.removeFollowingConditionals(conditional);

            // delete self, but keep children because this is true
            conditional.removeSelf(true);
        } else {
            // if not true, then delete
            conditional.removeSelf(false);
        }

        // mark as deleted
        htmlContext.setDeleted();
    }

    private removeFollowingConditionals(trueConditional: ConditionalNode): void {
        let currentConditional: ConditionalNode | null = trueConditional.nextConditional;

        while (currentConditional != null) {
            // save next in case we remove this one
            const nextConditional: ConditionalNode | null = currentConditional.nextConditional;

            // remove conditional
            currentConditional.removeSelf();

            // move on to text
            currentConditional = nextConditional;
        }
    }

    private compileMFor(mFor: MForNode, htmlContext: HtmlCompilerContext): void {
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
        htmlContext.setDeleted();
    }

    private evaluateMFor(mFor: MForNode): MForIteration[] {
        if (MForOfNode.isMForOfNode(mFor)) {
            return this.evaluateForOf(mFor.expression);
        } else if (MForInNode.isMForInNode(mFor)) {
            return this.evaluateForIn(mFor.expression);
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

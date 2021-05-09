import {HtmlCompilerContext, HtmlCompilerModule} from '../htmlCompiler';
import {EvalContext, TagNode, TextNode} from '../../..';

/**
 * Compile module that detects and evaluates embedded JS expressions in attributes and text nodes
 */
export class ExpressionModule implements HtmlCompilerModule {
    enterNode(htmlContext: HtmlCompilerContext): void {
        if (TextNode.isTextNode(htmlContext.node)) {
            processTextNode(htmlContext, htmlContext.node);

        } else if (TagNode.isTagNode(htmlContext.node)) {
            processTagNode(htmlContext, htmlContext.node);
        }
    }
}

function processTextNode(htmlContext: HtmlCompilerContext, node: TextNode): void {
    // create eval context from the current scope
    const evalContext: EvalContext = htmlContext.createEvalContext();

    // compile text
    const textValue: unknown = htmlContext.sharedContext.pipelineContext.pipeline.compileExpression(node.text, evalContext);

    // save back to node
    node.text = (textValue !== null && textValue !== undefined) ? String(textValue) : '';
}

function processTagNode(htmlContext: HtmlCompilerContext, node: TagNode): void {
    // create eval context from the current scope
    const evalContext: EvalContext = htmlContext.createEvalContext();

    // loop through each attribute and compile it
    for (const entry of Array.from(node.getAttributes().entries())) {
        const key = entry[0];
        const value = entry[1];

        // only process strings, anything else must already be compiled
        if (typeof value === 'string') {
            // compile the value, preserving the raw output and not converting to a string
            const result: unknown = htmlContext.sharedContext.pipelineContext.pipeline.compileExpression(value, evalContext);

            node.setRawAttribute(key, result);
        }
    }
}
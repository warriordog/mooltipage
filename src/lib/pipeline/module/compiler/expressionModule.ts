import {HtmlCompilerContext, HtmlCompilerModule} from '../htmlCompiler';
import {TagNode, TextNode} from '../../..';

/**
 * Compile module that detects and evaluates embedded JS expressions in attributes and text nodes
 */
export class ExpressionModule implements HtmlCompilerModule {
    async enterNode(htmlContext: HtmlCompilerContext): Promise<void> {
        if (TextNode.isTextNode(htmlContext.node)) {
            await processTextNode(htmlContext, htmlContext.node);

        } else if (TagNode.isTagNode(htmlContext.node)) {
            await processTagNode(htmlContext, htmlContext.node);
        }
    }
}

async function processTextNode(htmlContext: HtmlCompilerContext, node: TextNode): Promise<void> {
    // create eval context from the current scope
    const evalContext = htmlContext.createEvalContext();

    // compile text
    const textValue = await htmlContext.sharedContext.pipelineContext.pipeline.compileExpression(node.text, evalContext);

    // save back to node
    node.text = (textValue !== null && textValue !== undefined) ? String(textValue) : '';
}

async function processTagNode(htmlContext: HtmlCompilerContext, node: TagNode): Promise<void> {
    // create eval context from the current scope
    const evalContext = htmlContext.createEvalContext();

    // loop through each attribute and compile it
    for (const entry of Array.from(node.getAttributes().entries())) {
        const key = entry[0];
        const value = entry[1];

        // only process strings, anything else must already be compiled
        if (typeof value === 'string') {
            // compile the value, preserving the raw output and not converting to a string
            const result = htmlContext.sharedContext.pipelineContext.pipeline.compileExpression(value, evalContext);

            // Set attribute
            node.setRawAttribute(key, await result);
        }
    }
}
import { HtmlCompilerModule, HtmlCompilerContext } from '../htmlCompiler';
import { TextNode, TagNode } from '../../..';
import { EvalContext } from '../evalEngine';
import { StandardPipeline } from '../../standardPipeline';

/**
 * Compile module that detects and evalutates embedded JS expressions in attributes and text nodes
 */
export class ExpressionsModule implements HtmlCompilerModule {
    enterNode(htmlContext: HtmlCompilerContext): void {
        if (TextNode.isTextNode(htmlContext.node)) {
            this.processTextNode(htmlContext, htmlContext.node);
        } else if (TagNode.isTagNode(htmlContext.node)) {
            this.processTagNode(htmlContext, htmlContext.node);
        }
    }

    private processTextNode(htmlContext: HtmlCompilerContext, node: TextNode): void {
        // create eval context from the current scope
        const evalContext: EvalContext = htmlContext.createEvalContext();

        // compile text
        const textValue: unknown = htmlContext.pipelineContext.pipeline.compileExpression(node.text, evalContext);
        const textString: string = textValue != null ? String(textValue) : '';

        // save back to node
        node.text = textString;
    }

    private processTagNode(htmlContext: HtmlCompilerContext, node: TagNode): void {
        // create eval context from the current scope
        const evalContext: EvalContext = htmlContext.createEvalContext();

        // loop through each attribute and compile it
        for (const entry of Array.from(node.getAttributes().entries())) {
            const key = entry[0];
            const value = entry[1];

            if (typeof(value) === 'string') {
                // compile the value, preserving the raw output and not converting to a string
                const result: unknown = htmlContext.pipelineContext.pipeline.compileExpression(value, evalContext);

                node.setRawAttribute(key, result);
            }
        }
    }

    private compileToText(pipeline: StandardPipeline, text: string, evalContext: EvalContext): string {
        const result: unknown = pipeline.compileExpression(text, evalContext);

        if (result == null) {
            return '';
        }

        return String(result);
    }
}
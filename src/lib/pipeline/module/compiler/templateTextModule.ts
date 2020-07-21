import { CompilerModule, CompileData, EvalContext, Node, TextNode, TagNode } from "../../..";

/**
 * Compile module that detects and evalutates embedded JS expressions in attributes and text nodes
 */
export class TemplateTextModule implements CompilerModule {
    compileFragment(compileData: CompileData): void {
        // process all text
        compileData.fragment.dom.walkDom((node: Node) => {
            if (TextNode.isTextNode(node)) {
                this.processTextNode(compileData, node);
            } else if (TagNode.isTagNode(node)) {
                this.processTagNode(compileData, node);
            }
        });
    }

    private processTextNode(compileData: CompileData, node: TextNode): void {
        // create eval context from the current scope
        const evalContext: EvalContext = compileData.createEvalContext(node.evalScope);

        // compile text
        const newText = this.compileToText(compileData, node.text, evalContext);

        // text nodes require text
        node.text = newText ?? '';
    }

    private processTagNode(compileData: CompileData, node: TagNode): void {
        // create eval context from the current scope
        const evalContext: EvalContext = compileData.createEvalContext(node.evalScope);

        // loop through each attribute and compile it
        for (const key of node.getAttributes().keys()) {
            const value = node.getAttribute(key);

            if (value != null) {
                // compile the value, preserving the raw output and not converting to a string
                const result: unknown = compileData.pipeline.compileDomText(value, evalContext);

                node.setRawAttribute(key, result);
            }
        }
    }

    private compileToText(compileData: CompileData, text: string, evalContext: EvalContext): string | null {
        const result: unknown = compileData.pipeline.compileDomText(text, evalContext);

        if (result == null) {
            return null;
        }

        return String(result);
    }
}

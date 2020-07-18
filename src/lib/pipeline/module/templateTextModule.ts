import { CompilerModule, CompileData, EvalContext, Node, TextNode, TagNode } from "../..";

/**
 * Compile module that detects and evalutates embedded JS expressions in attributes and text nodes
 */
export class TemplateTextModule implements CompilerModule {
    compileFragment(compileData: CompileData): void {
        // create eval context
        const evalContext: EvalContext = compileData.createEvalContext();

        // process all text
        compileData.fragment.dom.walkDom((node: Node) => {
            if (TextNode.isTextNode(node)) {
                this.processTextNode(compileData, node, evalContext);
            } else if (TagNode.isTagNode(node)) {
                this.processTagNode(compileData, node, evalContext);
            }
        });
    }

    private processTextNode(compileData: CompileData, node: TextNode, evalContext: EvalContext): void {
        const newText = this.compileToText(compileData, node.text, evalContext);

        // text nodes require text
        node.text = newText ?? '';
    }

    private processTagNode(compileData: CompileData, node: TagNode, evalContext: EvalContext): void {
        // loop through each attribute and compile it
        for (const key of node.getAttributes().keys()) {
            const value = node.getAttribute(key);

            if (value != null) {
                // compile the value to text, either by preserving existing text ofr by executing JS
                const newValue = this.compileToText(compileData, value, evalContext);

                node.setAttribute(key, newValue);
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

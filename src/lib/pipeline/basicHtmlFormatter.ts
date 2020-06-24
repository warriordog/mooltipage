import { Fragment } from "./object/fragment";
import { DocumentNode, Node, TextNode, NodeWithChildren } from '../dom/node';
import { HtmlFormatter } from "./htmlFormatter";
import { UsageContext } from "./usageContext";

export class BasicHtmlFormatter implements HtmlFormatter {
    private readonly isPretty: boolean;
    private readonly eol: string;
    private readonly indentString: string;

    constructor(isPretty: boolean, eol?: string, indentString?: string) {
        this.isPretty = isPretty;
        this.eol = eol ?? (isPretty ? '\n' : '');
        this.indentString = indentString ?? (isPretty ? '    ' : '');
    }

    // html-level formatting is not supported by this class
    formatHtml(resId: string, html: string): string {
        return html;
    }

    formatFragment(fragment: Fragment, usageContext: UsageContext): Fragment {
        // only format pages
        if (usageContext.isPage) {
            // pages are mutable, so we can edit in place
            const dom: DocumentNode = fragment.dom;
    
            // format whitespace
            this.formatWhitespace(dom);
        }

        return fragment;
    }

    protected formatWhitespace(startNode: Node, depth = 0): void {
        let currentNode: Node | null = startNode;

        while (currentNode != null) {
            // skip to first child of document
            if (DocumentNode.isDocumentNode(currentNode)) {
                currentNode = currentNode.firstChild;
                continue;
            }

            // get content node (if there is one)
            const contentNode: Node | null = this.getContentNode(currentNode);

            // get preceding text node, or insert it if possible
            const textNode: TextNode = this.getOrInsertTextNode(currentNode);
            
            // absorb adjacent text nodes
            this.absorbAdjacentTextNodes(textNode);
    
            // process text node
            this.formatTextNode(textNode, depth);

            // process children of content node
            if (contentNode != null && NodeWithChildren.isNodeWithChildren(contentNode) && contentNode.firstChild != null) {
                // no need to loop through children, child will process its own neighbors
                this.formatWhitespace(contentNode.firstChild, depth + 1);
            }

            // continue to next sibling, if found
            if (contentNode != null) {
                currentNode = contentNode.nextSibling;
            } else {
                currentNode = null;
            }
        }
    }

    private formatTextNode(textNode: TextNode, depth: number): void {
        // extract actual text from node
        const textContent: string | null = this.extractTextContent(textNode);

        // if this is inline text (or we are in ugly mode), then dont format
        if (this.isInlineText(textNode) || !this.isPretty) {
            if (textContent != null) {
                textNode.text = textContent;
            } else {
                textNode.removeSelf();
            }
        } else {
            // check if there is a following node
            const hasNeighbor: boolean = textNode.nextSibling != null;
    
            // start text with newline to close previous line
            let text: string = this.eol;
    
            // append text content, if any
            if (textContent != null) {
                // append content index
                for (let i = 0; i < depth; i++) {
                    text += this.indentString;
                }
    
                // apend text content
                text += textContent;
    
                // close out content line
                text += this.eol;
            }
    
            // append closing indent
            const closingIndentDepth: number = hasNeighbor ? depth : depth - 1;
            for (let i = 0; i < closingIndentDepth; i++) {
                text += this.indentString;
            }
    
            // set node content
            textNode.text = text;
        }
    }

    private isInlineText(textNode: TextNode): boolean {
        return textNode.prevSibling == null && textNode.nextSibling == null;
    }

    private extractTextContent(node: TextNode): string | null {
        let text: string = node.text;

        // check if node has text and text is non-empty
        if (/\S/.test(text)) {
            // remove leading and trailing whitespace
            text = text.trim();
    
            // compact whitespace in text
            text = text.replace(/\s{2,}/, ' ');

            return text;
        } else {
            return null;
        }
    }

    private absorbAdjacentTextNodes(textNode: TextNode): void {
        let currentNode: Node | null = textNode.nextSibling;
        
        while (currentNode != null && TextNode.isTextNode(currentNode)) {
            // back up node to remove it
            const removeNode: Node = currentNode;

            // steal its text
            textNode.text += currentNode.text;

            // increment to next node
            currentNode = currentNode.nextSibling;

            // remove stolen node
            removeNode.removeSelf();
        }
    }

    private getOrInsertTextNode(startNode: Node): TextNode {
        if (TextNode.isTextNode(startNode)) {
            // start node is text node
            return startNode;
        } else {
            // create new text node
            const textNode: TextNode = new TextNode('');
            
            // insert before startNode
            startNode.prependSibling(textNode);

            return textNode;
        }
    }

    private getContentNode(startNode: Node): Node | null {
        let currNode: Node | null = startNode;

        while (currNode != null && TextNode.isTextNode(currNode)) {
            currNode = currNode.nextSibling;
        }

        return currNode;
    }
}
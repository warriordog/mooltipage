import { HtmlFormatter, DocumentNode, Node, TextNode, NodeWithChildren } from '../..';

/**
 * Standard HTML formatter.
 * Implements minification, basic pretty formatting, and bypass modes.
 */
export class StandardHtmlFormatter implements HtmlFormatter {
    private readonly formatMode: StandardHtmlFormatterMode;
    private readonly eol: string;
    private readonly indentString: string;

    /**
     * Create a new StandardHtmlFormatter.
     * 
     * @param formatMode HTML formatting mode. Defaults to NONE.
     * @param eol Set the line ending for pretty mode (default \n)
     * @param indentString Set the indentation string for pretty mode (default 4 spaces)
     */
    constructor(formatMode: StandardHtmlFormatterMode = StandardHtmlFormatterMode.NONE, eol?: string, indentString?: string) {
        this.formatMode = formatMode;

        const isPretty = formatMode === StandardHtmlFormatterMode.PRETTY;
        this.eol = eol ?? (isPretty ? '\n' : '');
        this.indentString = indentString ?? (isPretty ? '    ' : '');
    }

    formatDom(dom: DocumentNode): void {
        // bypass if formatting is disabled
        if (this.formatMode !== StandardHtmlFormatterMode.NONE) {
            // format whitespace
            this.formatWhitespace(dom);
        }
    }

    formatHtml(html: string): string {
        // bypass if no formatting enabled
        if (this.formatMode === StandardHtmlFormatterMode.NONE) {
            return html;
        }

        // trim to clean up any leading or trailing whitespace
        return html.trim();
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
            const contentNode: Node | null = StandardHtmlFormatter.getContentNode(currentNode);

            // get preceding text node, or insert it if possible
            const textNode: TextNode = StandardHtmlFormatter.getOrInsertTextNode(currentNode);
            
            // absorb adjacent text nodes
            StandardHtmlFormatter.absorbAdjacentTextNodes(textNode);
    
            // process text node
            this.formatTextNode(textNode, depth);

            // process children of content node
            if (contentNode != null && NodeWithChildren.isNodeWithChildren(contentNode) && contentNode.firstChild != null) {
                // no need to loop through children, child will process its own neighbors
                this.formatWhitespace(contentNode.firstChild, depth + 1);
            }

            if (contentNode != null) {
                const nextNode = contentNode.nextSibling;

                if (nextNode != null) {
                    // continue to next sibling, if found
                    currentNode = nextNode;
                } else {
                    // If this is the last node at this level, insert a final text node and iterate one more time to support closing indentation
                    const newLastNode = new TextNode();
                    contentNode.appendSibling(newLastNode);
                    currentNode = newLastNode;
                }
            } else {
                // if this is the last node and it IS a text node, then we are done
                currentNode = null;
            }
        }
    }

    private formatTextNode(textNode: TextNode, depth: number): void {
        // extract actual text from node
        const textContent: string | null = StandardHtmlFormatter.extractTextContent(textNode);

        // if this is inline text (or we are in ugly mode), then dont format
        if (StandardHtmlFormatter.isInlineText(textNode) || this.formatMode === StandardHtmlFormatterMode.MINIMIZED) {
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
    
                // append text content
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

    private static isInlineText(textNode: TextNode): boolean {
        // inline text is a text node with no siblings, and no more than one line of non-whitespace content
        return textNode.prevSibling == null && textNode.nextSibling == null && /^\s*([^\s]| )+\s*$/g.test(textNode.text);
    }

    private static extractTextContent(node: TextNode): string | null {
        let text: string = node.text;

        // check if node has text and text is non-empty
        if (/\S/.test(text)) {
            // remove leading and trailing whitespace
            text = text.trim();
    
            // compact whitespace in text
            text = text.replace(/\s{2,}/gm, ' ');

            return text;
        } else {
            return null;
        }
    }

    private static absorbAdjacentTextNodes(textNode: TextNode): void {
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

    private static getOrInsertTextNode(startNode: Node): TextNode {
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

    private static getContentNode(startNode: Node): Node | null {
        let currNode: Node | null = startNode;

        while (currNode != null && TextNode.isTextNode(currNode)) {
            currNode = currNode.nextSibling;
        }

        return currNode;
    }
}

/**
 * Formatting styles for the standard HtmlFormatter.
 * These do not have to be respected by subclasses
 */
export enum StandardHtmlFormatterMode {
    /**
     * Pretty mode - will format HTML for human readability
     */
    PRETTY = 'pretty',

    /**
     * Minimized / "ugly" mode - compacts HTML to single line
     */
    MINIMIZED = 'minimized',

    /**
     * None / disabled mode - do not modify the HTML
     */
    NONE = 'none'
}
import { Fragment } from "../pipeline/fragment";
import { Page } from "../pipeline/page";
import { Dom } from '../pipeline/dom';
import { Node, DataNode } from 'domhandler';
import { ElementType } from "domelementtype";
import * as DomUtils from 'domutils';
import { HtmlFormatter } from "../pipeline/htmlFormatter";

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

    // fragment-level formatting is not supported by this class
    formatFragment(fragment: Fragment): Fragment {
        return fragment;
    }

    formatPage(page: Page): Page {
        // pages are mutable, so we can edit in place
        const dom: Dom = page.dom;

        if (dom.length > 0) {
            // format whitespace (pretty mode)
            this.formatWhitespace(dom[0], true);
        }

        return page;
    }

    protected formatWhitespace(startNode: Node, isPretty: boolean, depth = 0): void {
        let currentNode: Node | null = startNode;

        while (currentNode != null) {

            // get preceding text node, or insert it if possible
            const textNode = this.getOrInsertTextNode(currentNode);
    
            // format text node if present
            if (textNode != null) {

                // absorb adjacent text nodes
                this.absorbAdjacentTextNode(textNode);
        
                // process text node
                this.formatTextNode(textNode, depth);
            }

            // get content node (if there is one)
            const contentNode: Node | null = this.getContentNode(currentNode);

            // process children of content node
            if (contentNode != null && DomUtils.hasChildren(contentNode) && contentNode.firstChild != null) {
                // no need to loop through children, child will process its own neighbors
                this.formatWhitespace(contentNode.firstChild, isPretty, depth + 1);
            }

            // continue to next sibling, if found
            if (contentNode != null) {
                currentNode = contentNode.nextSibling;
            } else {
                currentNode = null;
            }
        }
    }

    private formatTextNode(textNode: DataNode, depth: number): void {
        // extract actual text from node
        const textContent: string | null = this.extractTextContent(textNode);

        // if this is inline text, then dont format
        if (this.isInlineText(textNode)) {
            if (textContent != null) {
                textNode.data = textContent;
            } else {
                DomUtils.removeElement(textNode);
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
            textNode.data = text;
        }
    }

    private isInlineText(textNode: DataNode): boolean {
        return textNode.previousSibling == null && textNode.nextSibling == null;
    }

    private extractTextContent(node: DataNode): string | null {
        let text = node.data;

        // check if node has text and text is non-empty
        if (text != null && text.match(/\S/) != null) {
            // remove leading and trailing whitespace
            text = text.trim();
    
            // compact whitespace in text
            text = text.replace(/\s{2,}/, ' ');

            return text;
        } else {
            return null;
        }
    }

    private absorbAdjacentTextNode(textNode: DataNode): void {
        let currentNode: Node | null = textNode.nextSibling;
        
        while (currentNode != null && DomUtils.isText(currentNode)) {
            // back up node to remove it
            const removeNode: Node = currentNode;

            // steal its text
            const newText: string = (textNode.data ?? '') + currentNode.data;
            textNode.data = newText;

            // increment to next node
            currentNode = currentNode.nextSibling;

            // remove stolen node
            DomUtils.removeElement(removeNode);
        }
    }

    private getOrInsertTextNode(startNode: Node): DataNode | null {
        if (DomUtils.isText(startNode)) {
            // start node is text node
            return startNode;
        } else {
            // create new text node
            const textNode: DataNode = new DataNode(ElementType.Text, '');
            
            // insert before startNode
            DomUtils.prepend(startNode, textNode);

            return textNode;
        }
    }

    private getContentNode(startNode: Node): Node | null {
        let currNode: Node | null = startNode;

        while (currNode != null && DomUtils.isText(currNode)) {
            currNode = currNode.nextSibling;
        }

        return currNode;
    }
}
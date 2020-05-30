import { HtmlFormatter } from "../compiler/pipeline";
import Fragment from "../compiler/fragment";
import Page from "../compiler/page";

export abstract class BasicHtmlFormatter<TFragment extends Fragment, TPage extends Page> implements HtmlFormatter<TFragment, TPage> {
    private readonly eol: string;
    private readonly indentString: string;

    constructor(indentString: string, eol: string) {
        this.indentString = indentString;
        this.eol = eol;
    }


    formatPage(page: TPage): TPage {
        // pages are mutable, so we can edit in place
        const dom: Document = page.dom;

        // format whitespace (pretty mode)
        this.formatWhitespace(dom, dom, true);

        return page;
    }

    protected formatWhitespace(dom: Document, startNode: Node, isPretty: boolean, depth: number = 0): void {
        let currentNode: Node | null = startNode;

        while (currentNode != null) {
            
            console.log(`Processing '${currentNode.nodeName}' at level ${depth}`);

            // for documents and the first node, dont format.  Just process children
            if (currentNode.nodeType !== 9 && currentNode.nodeType !== 11) {

                // get preceding text node, or insert it if possible
                const textNode = this.getOrInsertTextNode(dom, currentNode);
        
                // format text node if present
                if (textNode != null) {

                    // absorb adjacent text nodes
                    this.absorbAdjacentTextNode(dom, textNode);
            
                    // process text node
                    this.formatTextNode(textNode, depth);
                }

                // get content node (if there is one)
                const contentNode: Node | null = this.getContentNode(currentNode);

                // process children of content node
                if (contentNode != null && contentNode.firstChild != null) {
                    // no need to loop through children, child will process its own neighbors
                    this.formatWhitespace(dom, contentNode.firstChild, isPretty, depth + 1);
                }

                // skip ahead to contentNode
                currentNode = contentNode;
            } else if (currentNode.firstChild != null) {
                // process children of skipped node (don't increment depth)
                currentNode = currentNode.firstChild;
            }

            // continue to next sibiling, if found
            if (currentNode != null) {
                currentNode = currentNode.nextSibling;
            }
        }
    }

    private formatTextNode(textNode: Node, depth: number): void {
        // extract actual text from node
        const textContent: string | null = this.extractTextContent(textNode);

        // if this is inline text, then dont format
        if (this.isInlineText(textNode)) {
            textNode.textContent = textContent;
        } else {
            // check if there is a following node
            const hasNeighbor: boolean = textNode.nextSibling != null;
    
            // contentIndent = depth + 1
            // neighborIndent = depth
            // newline - [contentIndent - content - newline] - neighborIndent
    
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
            textNode.textContent = text;
        }
    }

    private isInlineText(textNode: Node): boolean {
        return textNode.previousSibling == null && textNode.nextSibling == null;
    }

    private extractTextContent(node: Node): string | null {
        let text = node.textContent;

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

    private absorbAdjacentTextNode(root: Node, textNode: Node): void {
        const parentNode = textNode.parentNode ?? root;

        let currentNode: Node | null = textNode.nextSibling;
        
        while (currentNode != null && currentNode.nodeType === 3) {
            // back up node to remove it
            const removeNode: Node = currentNode;

            // steal its text
            const newText: string = (textNode.textContent ?? '') + currentNode.textContent;
            textNode.textContent = newText;

            // increment to next node
            currentNode = currentNode.nextSibling;

            // remove stolen node
            parentNode.removeChild(removeNode);
        }
    }

    private getOrInsertTextNode(dom: Document, startNode: Node): Node | null {
        if (startNode.nodeType === 3) {
            // start node is text node
            return startNode;
        } else {
            const parentNode = startNode.parentNode;

            // if parent node is valid parent of #text element, then create one
            if (parentNode != null && this.isValidTextParent(parentNode)) {

                // create new text node
                const textNode: Text = dom.createTextNode('');
                
                // insert under parent
                parentNode.insertBefore(textNode, startNode);

                return textNode;
            } else {
                // if there is no text node and this is a root element (ie <!DOCTYPE>, <html>, etc) then return null
                return null;
            }
        }
    }

    private isValidTextParent(parentNode: Node): boolean {
        const nt = parentNode.nodeType;
        return nt === 1 || nt === 2 || nt === 5 || nt === 6 || nt === 11;
    }

    private getContentNode(startNode: Node): Node | null {
        let currNode: Node | null = startNode;

        while (currNode != null && currNode.nodeType === 3) {
            currNode = currNode.nextSibling;
        }

        return currNode;
    }

    formatHtml(resId: string, html: string): string {
        // fix up HTML formatting errors caused by JSDOM limitations
        html = html.replace(/<\/html>$/i, this.eol + '</html>');
        html = html.replace(/^<!DOCTYPE html>/i, '<!DOCTYPE html>' + this.eol);

        return html;
    }

    // fragment-level formatting is not supported by this class
    formatFragment(fragment: TFragment): TFragment {
        return fragment;
    }
}

export class BasicHtmlPrettier<TFragment extends Fragment, TPage extends Page> extends BasicHtmlFormatter<TFragment, TPage> {
    constructor(eol: string = '\n', indentString: string = '    ') {
        super(indentString, eol);
    }
}

export class BasicHtmlUglier<TFragment extends Fragment, TPage extends Page> extends BasicHtmlFormatter<TFragment, TPage> {
    constructor() {
        // not necessary, but disable indent and EOL just in case
        super('', '');
    }
}
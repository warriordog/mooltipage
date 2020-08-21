import {
    DocumentNode,
    HtmlFormatter,
    Node,
    NodeType,
    NodeWithChildren,
    TextNode
} from '../..';

/**
 * Standard HTML formatter.
 * Implements minification, basic pretty formatting, and bypass modes.
 */
export class StandardHtmlFormatter implements HtmlFormatter {
    readonly options: FormatterOptions;

    /**
     * Create a new StandardHtmlFormatter.
     * Configuration options can be passed through the {@link options} parameter.
     * If a partial options object is provided, then the missing options will be inherited from {@link NoneFormatterPreset}.
     * 
     * @param options Configuration options for the formatter
     */
    constructor(options?: Partial<FormatterOptions>) {
        this.options = createFormatterOptions(options);
    }

    formatDom(dom: DocumentNode): void {
        // bypass if formatting is disabled
        if (this.options.formatMode !== FormatterMode.NONE) {
            // strip comments, if enabled
            if (this.options.stripComments) {
                this.stripComments(dom);
            }

            // strip CDATA, if enabled
            if (this.options.stripCDATA) {
                this.stripCDATA(dom);
            }

            // format whitespace
            this.formatWhitespace(dom);
        }
    }

    formatHtml(html: string): string {
        // bypass if no formatting enabled
        if (this.options.formatMode === FormatterMode.NONE) {
            return html;
        }

        // trim to clean up any leading or trailing whitespace
        return html.trim();
    }

    protected stripComments(root: NodeWithChildren): void {
        for (const commentNode of root.findChildNodesByNodeType(NodeType.Comment)) {
            commentNode.removeSelf();
        }
    }

    protected stripCDATA(root: NodeWithChildren): void {
        for (const cdataNode of root.findChildNodesByNodeType(NodeType.CDATA)) {
            cdataNode.removeSelf();
        }
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

            if (contentNode != null) {
                // process children of content node
                if (NodeWithChildren.isNodeWithChildren(contentNode) && contentNode.firstChild != null) {

                    // no need to loop through children, child will process its own neighbors
                    this.formatWhitespace(contentNode.firstChild, depth + 1);
                }

                // pick next node
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
        if (StandardHtmlFormatter.isInlineText(textNode) || this.options.formatMode === FormatterMode.MINIMIZED) {
            if (textContent != null) {
                textNode.text = textContent;
            } else {
                textNode.removeSelf();
            }
        } else {
            // start text with newline to close previous line
            const text = [ this.options.endOfLine ];
    
            // append text content, if any
            if (textContent != null) {
                // append content index
                for (let i = 0; i < depth; i++) {
                    text.push(this.options.indentString);
                }
    
                // append text content
                text.push(textContent);
    
                // close out content line
                text.push(this.options.endOfLine);
            }

            // append closing indent if there is a following node
            const hasNeighbor: boolean = textNode.nextSibling != null;
            const closingIndentDepth: number = hasNeighbor ? depth : depth - 1;
            for (let i = 0; i < closingIndentDepth; i++) {
                text.push(this.options.indentString);
            }
    
            // set node content
            textNode.text = text.join('');
        }
    }

    private static isInlineText(textNode: TextNode): boolean {
        // inline text is a text node with no siblings, and no more than one line of non-whitespace content
        return textNode.prevSibling == null && textNode.nextSibling == null && /^\s*([^\s]| )+\s*$/g.test(textNode.text);
    }

    private static extractTextContent(textNode: TextNode): string | null {
        // check if node has text and text is non-empty
        if (textNode.hasContent) {
            // compact whitespace in text
            return textNode.textContent.replace(/\s{2,}/gm, ' ');
        } else {
            return null;
        }
    }

    private static absorbAdjacentTextNodes(textNode: TextNode): void {
        const newTextParts = [ textNode.text ];

        let currentNode: Node | null = textNode.nextSibling;
        while (currentNode != null && TextNode.isTextNode(currentNode)) {
            // save next node, since we might remove this one
            const nextNode = currentNode.nextSibling;

            // steal its text
            newTextParts.push(currentNode.text);

            // remove stolen node
            currentNode.removeSelf();

            // increment to next node
            currentNode = nextNode;
        }

        // combine string parts and assign to node
        textNode.text = newTextParts.join('');
    }

    private static getOrInsertTextNode(startNode: Node): TextNode {
        if (TextNode.isTextNode(startNode)) {
            // start node is text node
            return startNode;
        } else {
            // create new text node
            const textNode: TextNode = new TextNode();
            
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
export enum FormatterMode {
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

/**
 * Configuration options to modify the behavior of {@link StandardHtmlFormatter}
 */
export interface FormatterOptions {
    /**
     * General formatter mode
     */
    readonly formatMode: FormatterMode;

    /**
     * String to use as a line terminator.
     */
    readonly endOfLine: string;

    /**
     * String to use as indentation.
     * This string will be repeated once for each level of indentation.
     */
    readonly indentString: string;

    /**
     * If true, XML comments will be removed
     */
    readonly stripComments: boolean;

    /**
     * If true, CDATA sections will be removed
     */
    readonly stripCDATA: boolean;
}


/**
 * Formatter preset that disables all processing.
 * Input DOM and HTML will be ignore and unchanged.
 */
export const NoneFormatterPreset: FormatterOptions = {
    formatMode: FormatterMode.NONE,
    indentString: '',
    endOfLine: '',
    stripComments: false,
    stripCDATA: false
};

/**
 * Formatter preset that attempts to "prettify" the generated HTML.
 * This mode applies formatting and indentation, and strips CDATA sections.
 * HTML comments are left in place.
 */
export const PrettyFormatterPreset: FormatterOptions = {
    formatMode: FormatterMode.PRETTY,
    indentString: '    ',
    endOfLine: '\n',
    stripComments: false,
    stripCDATA: true
};

/**
 * Formatter preset that minimizes the generated HTML.
 * This mode compacts whitespace, strips comments and CDATA, and packs all markup onto a single line.
 */
export const MinimizedFormatterPreset: FormatterOptions = {
    formatMode: FormatterMode.MINIMIZED,
    indentString: '',
    endOfLine: '',
    stripComments: true,
    stripCDATA: true
};

/**
 * Creates a complete {@link FormatterOptions} object from a partial object and a default object.
 * If {@link defaultOptions} is not specified, {@link NoneFormatterPreset} will be used.
 * If {@link options} is not specified, then {@link defaultOptions} will be used directly.
 *
 * @param defaultOptions {@link FormatterOptions} object to pull default values from
 * @param options Partial {@link FormatterOptions} object to override {@link defaultOptions}
 * @returns returns a complete {@link FormatterOptions} object created from {@link defaultOptions} and {@link options}
 */
export function createFormatterOptions(options?: Partial<FormatterOptions>, defaultOptions = NoneFormatterPreset): FormatterOptions {
    if (options !== undefined) {
        // inherit from default options and assign any provided properties
        return Object.assign(Object.create(defaultOptions), options) as FormatterOptions;
    } else {
        return defaultOptions;
    }
}
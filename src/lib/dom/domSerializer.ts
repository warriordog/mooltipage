import { Node, TagNode, TextNode, CommentNode, DocumentNode, CDATANode, ProcessingInstructionNode, NodeWithChildren } from "..";

// From https://stackoverflow.com/a/34838936/1857993
// contextual self-closing tags are not supported
const selfClosingTags: ReadonlyArray<string> = [
    'area',
    'base',
    'br',
    'col',
    'embed',
    'hr',
    'img',
    'input',
    'keygen',
    'link',
    'menuitem',
    'meta',
    'param',
    'source',
    'track',
    'wbr'
];

/**
 * Serializes a DOM into HTML
 */
export class DomSerializer {
    /**
     * Serialize a DOM tree
     * @param node Root node
     */
    serialize(node: Node): string {
        const html: string[] = [];

        this.serializeNode(node, html);

        return html.join('');
    }

    private serializeNode(node: Node, html: string[]): void {
        if (TagNode.isTagNode(node)) {
            this.serializeTag(node, html);
        } else if (TextNode.isTextNode(node)) {
            this.serializeText(node, html);
        } else if (CommentNode.isCommentNode(node)) {
            this.serializeComment(node, html);
        } else if (DocumentNode.isDocumentNode(node)) {
            this.serializeDocument(node, html);
        } else if (CDATANode.isCDATANode(node)) {
            this.serializeCDATA(node, html);
        } else if (ProcessingInstructionNode.isProcessingInstructionNode(node)) {
            this.serializeProcessingInstruction(node, html);
        } else {
            throw new Error(`Unknown nodeType: ${node.nodeType}`);
        }
    }

    private serializeDocument(dom: DocumentNode, html: string[]): void {
        this.serializeChildNodes(dom, html);
    }

    private serializeTag(tag: TagNode, html: string[]): void {
        const tagName = tag.tagName.toLowerCase();
        this.validateTagText(tagName);

        html.push('<');
        html.push(tagName);
        
        if (tag.getAttributes().size > 0) {
            this.appendAttributeList(tag.getAttributes(), html);
        }

        if (this.isSelfClosingTag(tagName)) {
            html.push(' />');
        } else {
            html.push('>');

            this.serializeChildNodes(tag, html);

            html.push('</');
            html.push(tagName);
            html.push('>');
        }
    }

    private serializeText(text: TextNode, html: string[]): void {
        const textContent: string = this.escapeTextContent(text.text);

        if (textContent.length > 0) {
            html.push(textContent);
        }
    }

    private serializeComment(comment: CommentNode, html: string[]): void {
        html.push('<!--');
        const textContent: string = this.escapeTextContent(comment.text);

        if (textContent.length > 0) {
            html.push(textContent);
        }
        html.push('-->');
    }

    private serializeCDATA(cdata: CDATANode, html: string[]): void {
        html.push('<![CDATA[');

        this.serializeChildNodes(cdata, html);

        html.push(']]>');
    }

    // this implementation is probably not accurate, but its good enough for <!DOCTYPE html>
    private serializeProcessingInstruction(pi: ProcessingInstructionNode, html: string[]): void {
        if (pi.name === '!doctype') {
            this.serializeDoctypePI(pi, html);
        } else {
            throw new Error(`Unimplemented processing instruction: ${pi.name}`);
        }
    }

    private serializeDoctypePI(pi: ProcessingInstructionNode, html: string[]): void {
        this.validateTagText(pi.data);

        html.push('<');
        html.push(pi.data);
        html.push('>');
    }

    private serializeChildNodes(parent: NodeWithChildren, html: string[]): void {
        for (const childNode of parent.childNodes) {
            this.serializeNode(childNode, html);
        }
    }

    private validateTagText(tagName: string): void {
        if (/[<>"&]+/.test(tagName)) {
            throw new Error(`Invalid tag name: ${tagName}`);
        }
    }

    private escapeTextContent(textContent: string): string {
        return textContent.replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;').replace('&', '&amp;');
    }

    private appendAttributeList(attributeMap: ReadonlyMap<string, string | null>, html: string[]): void {
        for (const entry of attributeMap.entries()) {
            const key = entry[0];
            const value = entry[1];

            html.push(' ');

            html.push(key);
            
            if (value != null) {
                this.validateTagText(value);

                html.push('="');
                html.push(value);
                html.push('"');
            }
        }
    }

    private isSelfClosingTag(tagName: string): boolean {
        return selfClosingTags.includes(tagName);
    }
}
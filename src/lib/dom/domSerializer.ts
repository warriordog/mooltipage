import { Node, TagNode, NodeWithChildren, TextNode, CommentNode, CDATANode, ProcessingInstructionNode, DocumentNode } from "./node";

// From https://stackoverflow.com/a/34838936/1857993
// contextual self-closing tags are not supported
export const selfClosingTags: ReadonlyArray<string> = [
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

export class DomSerializer {

    serialize(node: Node): string {
        const html: string[] = [];

        this.serializeNode(node, html);

        return html.join();
    }

    private serializeNode(node: Node, html: string[]): void {
        /*this.writeOpenText(node, html);

        if (NodeWithChildren.isNodeWithChildren(node)) {
            for (const childNode of node.childNodes) {
                this.serializeNode(childNode, html);
            }
        }

        if (this.hasCloseText(node)) {
            this.writeCloseText(node, html);
        }*/
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
        } else if (ProcessingInstructionNode.isProcessingInstruction(node)) {
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

        const attributes = this.buildAttributeList(tag.attributes);

        html.push('<');
        html.push(tagName);

        if (attributes != null) {
            html.push(' ');
            html.push(...attributes);
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
        throw new Error('Not implemented');
    }

    // this implementation is probably not accurate, but its good enough for <!DOCTYPE html>
    private serializeProcessingInstruction(pi: ProcessingInstructionNode, html: string[]): void {
        this.validateTagText(pi.name);

        html.push('<');
        html.push(pi.name);

        if (pi.data.length > 0) {
            this.validateTagText(pi.data);

            html.push(' ');
            html.push(pi.data);
        }

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

    private buildAttributeList(attributeMap: Map<string, string | null>): string[] | null {
        if (attributeMap.size == 0) {
            return null;
        }

        const attrs: string[] = [];

        let first = true;
        for (const entry of attributeMap.entries()) {
            const key = entry[0];
            const value = entry[1];

            if (first) {
                attrs.push(' ');   
            }

            attrs.push(key);
            
            if (value != null) {
                this.validateTagText(value);

                attrs.push('="');
                attrs.push(value);
                attrs.push('"');
            }

            first = false;
        }

        return attrs;
    }

    private isSelfClosingTag(tagName: string): boolean {
        return selfClosingTags.includes(tagName);
    }
}
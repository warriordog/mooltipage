import { Handler } from 'htmlparser2/lib/Parser';
import { TagNode, NodeWithChildren, TextNode, CommentNode, CDATANode, ProcessingInstructionNode, DocumentNode, MFragmentNode, MComponentNode, MSlotNode, MContentNode, MVarNode } from "./node";

export class DomParser implements Partial<Handler> {
    dom: DocumentNode;
    currentParent: NodeWithChildren;

    constructor() {
        this.dom = new DocumentNode();
        this.currentParent = this.dom;
    }

    onreset(): void {
        this.dom = new DocumentNode();
        this.currentParent = this.dom;
    }

    onerror(error: Error): void {
        throw error;
    }

    onopentag(name: string, attribs: { [s: string]: string }): void {
        // normalize tag name
        const tagName = name.toLowerCase();

        // copy attribs
        const attributes = new Map<string, string | null>();
        for (const key of Object.keys(attribs)) {
            const attrVal = attribs[key];
            const value: string | null = attrVal != undefined && attrVal.length > 0 ? attrVal : null;
            attributes.set(key, value);
        }

        // create tag
        const tag: TagNode = this.createTagNode(tagName, attributes);

        this.pushParent(tag);
    }

    onclosetag(): void {
        this.popParent();
    }

    ontext(data: string): void {
        // create text node
        const textNode = new TextNode(data);

        // append to parent
        this.currentParent.appendChild(textNode);
    }

    oncomment(data: string): void {
        // create comment node
        const commentNode = new CommentNode(data);

        // append to parent
        this.currentParent.appendChild(commentNode);
    }

    oncdatastart(): void {
        // create cdata node
        const cdataNode = new CDATANode();

        // append to parent
        this.currentParent.appendChild(cdataNode);

        // set as parent
        this.pushParent(cdataNode);
    }

    oncdataend(): void {
        this.popParent();
    }
    
    onprocessinginstruction(name: string, data: string): void {
        // create node
        const piNode = new ProcessingInstructionNode(name, data);

        // append to parent
        this.currentParent.appendChild(piNode);
    }

    private pushParent(node: NodeWithChildren): void {
        // attach to parent
        this.currentParent.appendChild(node);

        // push node
        this.currentParent = node;
    }

    private popParent(): void {
        if (this.currentParent == null) {
            throw new Error('Tried to close too many tags');
        }

        if (this.currentParent === this.dom) {
            throw new Error('Tried to close too many tags: DOM is currentParent');
        }
        
        this.currentParent = this.currentParent.parentNode ?? this.dom;
    }
    
    private createTagNode(tagName: string, attributes: Map<string, string | null>): TagNode {
        switch (tagName) {
            case 'm-fragment':
                return new MFragmentNode(attributes);
            case 'm-component':
                return new MComponentNode(attributes);
            case 'm-slot':
                return new MSlotNode(attributes);
            case 'm-content':
                return new MContentNode(attributes);
            case 'm-var':
                return new MVarNode(attributes);
            default:
                return new TagNode(tagName, attributes);
        }
    }
}
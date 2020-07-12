import * as NodeTools from './nodeTools';

export enum NodeType {
    Tag = 'tag',
    Text = 'text',
    Comment = 'comment',
    CDATA = 'cdata',
    ProcessingInstruction = 'processinginstruction',
    Document = 'document'
}

export abstract class Node {
    readonly nodeType: NodeType;

    parentNode: NodeWithChildren | null = null;

    prevSibling: Node | null = null;
    nextSibling: Node | null = null;

    constructor(nodeType: NodeType) {
        this.nodeType = nodeType;
    }

    appendSibling(node: Node): void {
        NodeTools.appendSibling(node, this);
    }
    prependSibling(node: Node): void {
        NodeTools.prependSibling(node, this);
    }

    removeSelf(): void {
        NodeTools.detatchNode(this);
    }
    replaceSelf(...nodes: Node[]): void {
        NodeTools.replaceNode(this, nodes);
    }

    abstract clone(deep?: boolean, callback?: (oldNode: Node, newNode: Node) => void): Node;
}

export abstract class NodeWithChildren extends Node {
    childNodes: Node[] = [];

    get firstChild(): Node | null {
        return NodeTools.getFirstChild(this.childNodes);
    }

    get lastChild(): Node | null {
        return NodeTools.getLastChild(this.childNodes);
    }

    getChildTags(): TagNode[] {
        return NodeTools.getChildTags(this);
    }
    
    appendChild(child: Node): void {
        NodeTools.appendChild(this, child);
    }
    prependChild(child: Node): void {
        NodeTools.prependChild(this, child);
    }
    removeChild(child: Node): void {
        NodeTools.detatchNode(child);
    }
    clear(): void {
        NodeTools.clear(this);
    }
    appendChildren(children: Node[]): void {
        NodeTools.appendChildNodes(this, children);
    }

    findChildNode(matcher: (node: Node) => boolean, deep = true): Node | null {
        return NodeTools.findChildNode(this, matcher, deep);
    }
    findChildNodes(matcher: (node: Node) => boolean, deep = true): Node[] {
        return NodeTools.findChildNodes(this, matcher, deep);
    }
    findTopLevelChildNodes(matcher: (node: Node) => boolean): Node[] {
        return NodeTools.findTopLevelChildNodes(this, matcher);
    }

    findChildTag(matcher: (tag: TagNode) => boolean, deep = true): TagNode | null {
        return NodeTools.findChildTag(this, matcher, deep);
    }
    findChildTags(matcher: (tag: TagNode) => boolean, deep = true): TagNode[] {
        return NodeTools.findChildTags(this, matcher, deep);
    }
    findTopLevelChildTags(matcher: (node: TagNode) => boolean): TagNode[] {
        return NodeTools.findTopLevelChildTags(this, matcher);
    }
    
    findChildTagsByPath(matchers: ((tag: TagNode) => boolean)[]): TagNode[] {
        return NodeTools.findChildTagsByPath(this, matchers);
    }

    walkDom(callback: (node: Node) => void): void {
        NodeTools.walkDom(this, callback);
    }

    createDomFromChildren(): DocumentNode {
        return NodeTools.createDomFromChildren(this);
    }

    removeSelf(keepChildren = false): void {
        if (keepChildren) {
            NodeTools.replaceNode(this, this.childNodes);
        } else {
            super.removeSelf();
        }
    }

    static isNodeWithChildren(node: Node): node is NodeWithChildren {
        return node.nodeType === NodeType.CDATA || node.nodeType === NodeType.Tag || node.nodeType === NodeType.Document;
    }
}

export abstract class NodeWithText extends Node {
    text: string;

    constructor(nodeType: NodeType, text: string) {
        super(nodeType);
        this.text = text;
    }

    static isNodeWithText(node: Node): node is NodeWithText {
        return node.nodeType === NodeType.Text || node.nodeType === NodeType.Comment;
    }
}

export abstract class NodeWithData extends Node {
    data: string;

    constructor(nodeType: NodeType, data: string) {
        super(nodeType);
        this.data = data;
    }

    static isNodeWithData(node: Node): node is NodeWithData {
        return node.nodeType === NodeType.ProcessingInstruction;
    }
}

export class TagNode extends NodeWithChildren {
    readonly tagName: string;
    protected attributes: Map<string, string | null>;

    constructor(tagName: string, attributes?: Map<string, string | null>) {
        super(NodeType.Tag);
        this.tagName = tagName;
        this.attributes = attributes ?? new Map<string, string | null>();
    }

    hasAttribute(name: string): boolean {
        return this.attributes.has(name);
    }

    getAttribute(name: string): string | null | undefined {
        return this.attributes.get(name);
    }

    getRequiredAttribute(name: string): string | null {
        if (!this.hasAttribute(name)) {
            throw new Error(`Missing required attribute '${name}'`);
        }

        // cannot be undefined, because we check above
        return this.getAttribute(name) as string | null;
    }

    getRequiredValueAttribute(name: string): string {
        const attr: string | null = this.getRequiredAttribute(name);

        if (attr == null) {
            throw new Error(`Missing value for required value attribute '${name}'`);
        }

        return attr;
    }

    getOptionalValueAttribute(name: string): string | undefined {
        if (this.hasAttribute(name)) {
            return this.getRequiredValueAttribute(name);
        } else {
            return undefined;
        }
    }

    setAttribute(name: string, value: string | null): void {
        this.attributes.set(name, value);
    }

    setRequiredValueAttribute(name: string, value: string): void {
        this.setAttribute(name, value);
    }

    deleteAttribute(name: string): void {
        this.attributes.delete(name);
    }

    getAttributes(): ReadonlyMap<string, string | null> {
        return this.attributes;
    }

    clone(deep = true, callback?: (oldNode: Node, newNode: Node) => void): TagNode {
        return NodeTools.cloneTagNode(this, deep, callback);
    }

    static isTagNode(node: Node): node is TagNode {
        return node.nodeType === NodeType.Tag;
    }
}

export class TextNode extends NodeWithText {
    constructor(text = '') {
        super(NodeType.Text, text);
    }

    clone(deep?: boolean, callback?: (oldNode: Node, newNode: Node) => void): TextNode {
        return NodeTools.cloneTextNode(this, callback);
    }

    static isTextNode(node: Node): node is TextNode {
        return node.nodeType === NodeType.Text;
    }
}

export class CommentNode extends NodeWithText {
    constructor(text = '') {
        super(NodeType.Comment, text);
    }

    clone(deep?: boolean, callback?: (oldNode: Node, newNode: Node) => void): CommentNode {
        return NodeTools.cloneCommentNode(this, callback);
    }

    static isCommentNode(node: Node): node is CommentNode {
        return node.nodeType === NodeType.Comment;
    }
}

export class CDATANode extends NodeWithChildren {
    constructor() {
        super(NodeType.CDATA);
    }

    clone(deep = true, callback?: (oldNode: Node, newNode: Node) => void): CDATANode {
        return NodeTools.cloneCDATANode(this, deep, callback);
    }

    static isCDATANode(node: Node): node is CDATANode {
        return node.nodeType === NodeType.CDATA;
    }
}

export class ProcessingInstructionNode extends NodeWithData {
    name: string;

    constructor(name = '', data = '') {
        super(NodeType.ProcessingInstruction, data);
        this.name = name;
    }

    clone(deep?: boolean, callback?: (oldNode: Node, newNode: Node) => void): ProcessingInstructionNode {
        return NodeTools.cloneProcessingInstructionNode(this, callback);
    }

    static isProcessingInstructionNode(node: Node): node is ProcessingInstructionNode {
        return node.nodeType === NodeType.ProcessingInstruction;
    }
}

export class DocumentNode extends NodeWithChildren {
    constructor() {
        super(NodeType.Document);
    }

    clone(deep = true, callback?: (oldNode: Node, newNode: Node) => void): DocumentNode {
        return NodeTools.cloneDocumentNode(this, deep, callback);
    }

    static isDocumentNode(node: Node): node is DocumentNode {
        return node.nodeType === NodeType.Document;
    }
}

export abstract class ExternalReferenceNode extends TagNode {
    readonly src: string;

    constructor(tagName: string, attributes: Map<string, string | null>) {
        super(tagName, attributes);

        this.src = this.getRequiredValueAttribute('src');
    }

    // must be dynamic to reflect changes to attributes
    get parameters(): ReadonlyMap<string, string> {
        const params: Map<string, string> = new Map();

        // extract fragment params
        for (const entry of this.attributes) {
            const key: string = entry[0];
            const value: string | null = entry[1];

            if (key != 'src' && value != null) {
                params.set(key, value);
            }
        
        }

        return params;
    }



    abstract clone(deep: boolean, callback?: (oldNode: Node, newNode: Node) => void): ExternalReferenceNode;
}

export class MFragmentNode extends ExternalReferenceNode {
    constructor(attributes: Map<string, string | null>) {
        super('m-fragment', attributes);
    }

    clone(deep = true, callback?: (oldNode: Node, newNode: Node) => void): MFragmentNode {
        return NodeTools.cloneMFragmentNode(this, deep, callback);
    }

    static isMFragmentNode(node: Node): node is MFragmentNode {
        return TagNode.isTagNode(node) && node.tagName === 'm-fragment';
    }
}

export class MComponentNode extends ExternalReferenceNode {
    constructor(attributes: Map<string, string | null>) {
        super('m-component', attributes);
    }

    clone(deep = true, callback?: (oldNode: Node, newNode: Node) => void): MComponentNode {
        return NodeTools.cloneMComponentNode(this, deep, callback);
    }

    static isMComponentNode(node: Node): node is MComponentNode {
        return TagNode.isTagNode(node) && node.tagName === 'm-component';
    }
}

export abstract class SlotReferenceNode extends TagNode {
    constructor(tagName: string, attributes?: Map<string, string | null>) {
        super(tagName, attributes);

        // populate slot name if missing
        if (!this.hasAttribute('slot')) {
            this.setAttribute('slot', '[default]');
        }
    }

    // must be dynamic to reflect attribute changes
    get slotName(): string {
        return this.getRequiredValueAttribute('slot')
    }

    abstract clone(deep: boolean, callback?: (oldNode: Node, newNode: Node) => void): SlotReferenceNode;
}

export class MContentNode extends SlotReferenceNode {
    constructor(attributes?: Map<string, string | null>) {
        super('m-content', attributes);
    }

    clone(deep = true, callback?: (oldNode: Node, newNode: Node) => void): MContentNode {
        return NodeTools.cloneMContentNode(this, deep, callback);
    }

    static isMContentNode(node: Node): node is MContentNode {
        return TagNode.isTagNode(node) && node.tagName === 'm-content';
    }
}

export class MSlotNode extends SlotReferenceNode {
    constructor(attributes?: Map<string, string | null>) {
        super('m-slot', attributes);
    }

    clone(deep = true, callback?: (oldNode: Node, newNode: Node) => void): MSlotNode {
        return NodeTools.cloneMSlotNode(this, deep, callback);
    }

    static isMSlotNode(node: Node): node is MSlotNode {
        return TagNode.isTagNode(node) && node.tagName === 'm-slot';
    }
}

export class MVarNode extends TagNode {
    constructor(attributes?: Map<string, string | null>) {
        super('m-var', attributes);
    }

    // this must be dynamic to reflect changes to attributes
    get variables(): ReadonlyMap<string, string> {
        const vars: Map<string, string> = new Map();

        // extract variables
        for (const entry of this.attributes) {
            const key: string = entry[0];
            const value: string | null = entry[1];

            if (value != null) {
                vars.set(key, value);
            }
        }

        return vars;
    }

    clone(deep = true, callback?: (oldNode: Node, newNode: Node) => void): MVarNode {
        return NodeTools.cloneMVarNode(this, deep, callback);
    }

    static isMVarNode(node: Node): node is MVarNode {
        return TagNode.isTagNode(node) && node.tagName === 'm-var';
    }
}
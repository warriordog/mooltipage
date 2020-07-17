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
    findChildTag(matcher: (tag: TagNode) => boolean, deep = true): TagNode | null {
        return NodeTools.findChildTag(this, matcher, deep);
    }
    findChildTags(matcher: (tag: TagNode) => boolean, deep = true): TagNode[] {
        return NodeTools.findChildTags(this, matcher, deep);
    }
    findTopLevelChildTags(matcher: (node: TagNode) => boolean): TagNode[] {
        return NodeTools.findTopLevelChildTags(this, matcher);
    }

    findChildNodeByNodeType(nodeType: NodeType.Document, deep?: boolean): DocumentNode | null;
    findChildNodeByNodeType(nodeType: NodeType.Tag, deep?: boolean): TagNode | null;
    findChildNodeByNodeType(nodeType: NodeType.Text, deep?: boolean): TextNode | null;
    findChildNodeByNodeType(nodeType: NodeType.Comment, deep?: boolean): CommentNode | null;
    findChildNodeByNodeType(nodeType: NodeType.CDATA, deep?: boolean): CDATANode | null;
    findChildNodeByNodeType(nodeType: NodeType.ProcessingInstruction, deep?: boolean): ProcessingInstructionNode | null;
    findChildNodeByNodeType(nodeType: NodeType, deep?: boolean): Node | null
    findChildNodeByNodeType(nodeType: NodeType, deep = true): Node | null {
        return this.findChildNode(node => node.nodeType === nodeType, deep);
    }
    findChildNodesByNodeType(nodeType: NodeType.Document, deep?: boolean): DocumentNode[];
    findChildNodesByNodeType(nodeType: NodeType.Tag, deep?: boolean): TagNode[];
    findChildNodesByNodeType(nodeType: NodeType.Text, deep?: boolean): TextNode[];
    findChildNodesByNodeType(nodeType: NodeType.Comment, deep?: boolean): CommentNode[];
    findChildNodesByNodeType(nodeType: NodeType.CDATA, deep?: boolean): CDATANode[];
    findChildNodesByNodeType(nodeType: NodeType.ProcessingInstruction, deep?: boolean): ProcessingInstructionNode[];
    findChildNodesByNodeType(nodeType: NodeType, deep?: boolean): Node[];
    findChildNodesByNodeType(nodeType: NodeType, deep = true): Node[] {
        return this.findChildNodes(node => node.nodeType === nodeType, deep);
    }
    findChildTagByTagName(tagName: 'm-fragment', deep?: boolean): MFragmentNode | null;
    findChildTagByTagName(tagName: 'm-component', deep?: boolean): MComponentNode | null;
    findChildTagByTagName(tagName: 'm-content', deep?: boolean): MContentNode | null;
    findChildTagByTagName(tagName: 'm-slot', deep?: boolean): MSlotNode | null;
    findChildTagByTagName(tagName: 'm-var', deep?: boolean): MVarNode | null;
    findChildTagByTagName(tagName: 'm-import', deep?: boolean): MImportNode | null;
    findChildTagByTagName(tagName: string, deep?: boolean): TagNode | null;
    findChildTagByTagName(tagName: string, deep = true): TagNode | null {
        return this.findChildTag(tag => tag.tagName === tagName, deep);
    }
    findChildTagsByTagName(tagName: 'm-fragment', deep?: boolean): MFragmentNode[];
    findChildTagsByTagName(tagName: 'm-component', deep?: boolean): MComponentNode[];
    findChildTagsByTagName(tagName: 'm-content', deep?: boolean): MContentNode[];
    findChildTagsByTagName(tagName: 'm-slot', deep?: boolean): MSlotNode[];
    findChildTagsByTagName(tagName: 'm-var', deep?: boolean): MVarNode[];
    findChildTagsByTagName(tagName: 'm-import', deep?: boolean): MImportNode[];
    findChildTagsByTagName(tagName: string, deep?: boolean): TagNode[];
    findChildTagsByTagName(tagName: string, deep = true): TagNode[] {
        return this.findChildTags(tag => tag.tagName === tagName, deep);
    }
    findTopLevelChildTagsByTagName(tagName: 'm-fragment'): MFragmentNode[];
    findTopLevelChildTagsByTagName(tagName: 'm-component'): MComponentNode[];
    findTopLevelChildTagsByTagName(tagName: 'm-content'): MContentNode[];
    findTopLevelChildTagsByTagName(tagName: 'm-slot'): MSlotNode[];
    findTopLevelChildTagsByTagName(tagName: 'm-var'): MVarNode[];
    findTopLevelChildTagsByTagName(tagName: 'm-import'): MImportNode[];
    findTopLevelChildTagsByTagName(tagName: string): TagNode[];
    findTopLevelChildTagsByTagName(tagName: string): TagNode[] {
        return this.findTopLevelChildTags(tag => tag.tagName === tagName);
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

    swapSelf(replacement: NodeWithChildren): void {
        NodeTools.swapNode(this, replacement);
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

    setBooleanAttribute(name: string, value: boolean): void {
        if (value) {
            this.setAttribute(name, null);
        } else {
            this.deleteAttribute(name);
        }
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
    constructor(tagName: string, src: string, attributes?: Map<string, string | null>) {
        super(tagName, attributes);

        this.setAttribute('src', src);
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

    get src(): string {
        return this.getRequiredValueAttribute('src');
    }
    set src(newSrc: string) {
        this.setAttribute('src', newSrc);
    }

    abstract clone(deep: boolean, callback?: (oldNode: Node, newNode: Node) => void): ExternalReferenceNode;
}

export class MFragmentNode extends ExternalReferenceNode {
    constructor(src: string, attributes?: Map<string, string | null>) {
        super('m-fragment', src, attributes);
    }

    clone(deep = true, callback?: (oldNode: Node, newNode: Node) => void): MFragmentNode {
        return NodeTools.cloneMFragmentNode(this, deep, callback);
    }

    static isMFragmentNode(node: Node): node is MFragmentNode {
        return TagNode.isTagNode(node) && node.tagName === 'm-fragment';
    }
}

export class MComponentNode extends ExternalReferenceNode {
    constructor(src: string, attributes?: Map<string, string | null>) {
        super('m-component', src, attributes);
    }

    clone(deep = true, callback?: (oldNode: Node, newNode: Node) => void): MComponentNode {
        return NodeTools.cloneMComponentNode(this, deep, callback);
    }

    static isMComponentNode(node: Node): node is MComponentNode {
        return TagNode.isTagNode(node) && node.tagName === 'm-component';
    }
}

export abstract class SlotReferenceNode extends TagNode {
    constructor(tagName: string, slot?: string | null | undefined, attributes?: Map<string, string | null>) {
        super(tagName, attributes);

        // populate slot name if missing
        this.setAttribute('slot', slot ?? '[default]');
    }

    // must be dynamic to reflect attribute changes
    get slot(): string {
        return this.getRequiredValueAttribute('slot')
    }
    set slot(newSlotName: string) {
        this.setAttribute('slot', newSlotName);
    }

    abstract clone(deep: boolean, callback?: (oldNode: Node, newNode: Node) => void): SlotReferenceNode;
}

export class MContentNode extends SlotReferenceNode {
    constructor(slot?: string | null | undefined, attributes?: Map<string, string | null>) {
        super('m-content', slot, attributes);
    }

    clone(deep = true, callback?: (oldNode: Node, newNode: Node) => void): MContentNode {
        return NodeTools.cloneMContentNode(this, deep, callback);
    }

    static isMContentNode(node: Node): node is MContentNode {
        return TagNode.isTagNode(node) && node.tagName === 'm-content';
    }
}

export class MSlotNode extends SlotReferenceNode {
    constructor(slot?: string | null | undefined, attributes?: Map<string, string | null>) {
        super('m-slot', slot, attributes);
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

export class MImportNode extends TagNode {
    constructor(src: string, as: string, fragment: boolean, component: boolean, attributes?: Map<string, string | null>) {
        super('m-import', attributes);

        this.setAttribute('src', src);
        this.setAttribute('as', as);
        this.setBooleanAttribute('fragment', fragment);
        this.setBooleanAttribute('component', component);
    }

    get src(): string {
        return this.getRequiredValueAttribute('src');
    }
    set src(newSrc: string) {
        this.setAttribute('src', newSrc);
    }

    get as(): string {
        return this.getRequiredValueAttribute('as');
    }
    set as(newAs: string) {
        this.setAttribute('as', newAs);
    }

    get fragment(): boolean {
        return this.hasAttribute('fragment');
    }
    set fragment(newFragment: boolean) {
        this.setBooleanAttribute('fragment', newFragment);
    }

    get component(): boolean {
        return this.hasAttribute('component');
    }
    set component(newComponent: boolean) {
        this.setBooleanAttribute('component', newComponent);
    }

    clone(deep = true, callback?: (oldNode: Node, newNode: Node) => void): MImportNode {
        return NodeTools.cloneMImportNode(this, deep, callback);
    }

    static isMImportNode(node: Node): node is MImportNode {
        return TagNode.isTagNode(node) && node.tagName === 'm-import';
    }
}
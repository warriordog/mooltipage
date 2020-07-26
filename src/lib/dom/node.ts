import { NodeTools } from "..";

/**
 * Recognized node types
 */
export enum NodeType {
    Tag = 'tag',
    Text = 'text',
    Comment = 'comment',
    CDATA = 'cdata',
    ProcessingInstruction = 'processinginstruction',
    Document = 'document'
}

/**
 * A DOM node
 */
export abstract class Node {
    /**
     * Type of this node
     */
    readonly nodeType: NodeType;

    /**
     * Parent of this node, or null if there is none.
     * Do not modify this directly, use NodeTools or instance methods.
     */
    parentNode: NodeWithChildren | null = null;

    /**
     * Previous sibling, or null.
     * Do not modify this directly, use NodeTools or instance methods.
     */
    prevSibling: Node | null = null;

    /**
     * Next sibling, or null.
     * Do not modify this directly, use NodeTools or instance methods.
     */
    nextSibling: Node | null = null;

    /**
     * TODO document
     */
    get prevSiblingTag(): TagNode | null {
        return NodeTools.getPreviousTag(this);
    }

    /**
     * TODO document
     */
    get nextSiblingTag(): TagNode | null {
        return NodeTools.getNextTag(this);
    }

    /**
     * Extra DOM data associated with this node.
     * This object prototypically inherits from the parent node's nodeData.
     */
    readonly nodeData: Record<PropertyKey, unknown> = {};

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
    replaceSelf(nodes: Node[]): void {
        NodeTools.replaceNode(this, nodes);
    }

    /**
     * Clone this node
     * @param deep If true, child nodes will be cloned
     * @param callback Optional callback for each node after cloning
     */
    abstract clone(deep?: boolean, callback?: (oldNode: Node, newNode: Node) => void): Node;
}

/**
 * Base type for any type of node that can have children
 */
export abstract class NodeWithChildren extends Node {
    /**
     * Children of this node.
     * Do not modify this directly, use NodeTools or instance methods.
     */
    childNodes: Node[] = [];

    get firstChild(): Node | null {
        return NodeTools.getFirstNode(this.childNodes);
    }

    get lastChild(): Node | null {
        return NodeTools.getLastNode(this.childNodes);
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
    findChildTagByTagName(tagName: 'm-scope', deep?: boolean): MScopeNode | null;
    findChildTagByTagName(tagName: 'm-import', deep?: boolean): MImportNode | null;
    findChildTagByTagName(tagName: 'm-if', deep?: boolean): MIfNode | null;
    findChildTagByTagName(tagName: 'm-for', deep?: boolean): MForNode | null;
    findChildTagByTagName(tagName: string, deep?: boolean): TagNode | null;
    findChildTagByTagName(tagName: string, deep = true): TagNode | null {
        return this.findChildTag(tag => tag.tagName === tagName, deep);
    }
    findChildTagsByTagName(tagName: 'm-fragment', deep?: boolean): MFragmentNode[];
    findChildTagsByTagName(tagName: 'm-component', deep?: boolean): MComponentNode[];
    findChildTagsByTagName(tagName: 'm-content', deep?: boolean): MContentNode[];
    findChildTagsByTagName(tagName: 'm-slot', deep?: boolean): MSlotNode[];
    findChildTagsByTagName(tagName: 'm-var', deep?: boolean): MVarNode[];
    findChildTagsByTagName(tagName: 'm-scope', deep?: boolean): MScopeNode[];
    findChildTagsByTagName(tagName: 'm-import', deep?: boolean): MImportNode[];
    findChildTagsByTagName(tagName: 'm-if', deep?: boolean): MIfNode[];
    findChildTagsByTagName(tagName: 'm-for', deep?: boolean): MForNode[];
    findChildTagsByTagName(tagName: string, deep?: boolean): TagNode[];
    findChildTagsByTagName(tagName: string, deep = true): TagNode[] {
        return this.findChildTags(tag => tag.tagName === tagName, deep);
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

    /**
     * Returns true if a node is an instance of NodeWithChildren
     * @param node Node to check
     */
    static isNodeWithChildren(node: Node): node is NodeWithChildren {
        return node.nodeType === NodeType.CDATA || node.nodeType === NodeType.Tag || node.nodeType === NodeType.Document;
    }
}

/**
 * Parent type for any node that includes textual data
 */
export abstract class NodeWithText extends Node {
    /**
     * Text contained by this node
     */
    text: string;

    constructor(nodeType: NodeType, text: string) {
        super(nodeType);
        this.text = text;
    }

    /**
     * Returns true if a node is an instance of NodeWithText
     * @param node Node to check
     */
    static isNodeWithText(node: Node): node is NodeWithText {
        return node.nodeType === NodeType.Text || node.nodeType === NodeType.Comment;
    }
}

/**
 * Parent type for any node that includes raw data
 */
export abstract class NodeWithData extends Node {
    /**
     * Data contained by this node
     */
    data: string;

    constructor(nodeType: NodeType, data: string) {
        super(nodeType);
        this.data = data;
    }

    /**
     * Returns true if a node is an instance of NodeWithData
     * @param node Node to check
     */
    static isNodeWithData(node: Node): node is NodeWithData {
        return node.nodeType === NodeType.ProcessingInstruction;
    }
}

/**
 * A tag node
 */
export class TagNode extends NodeWithChildren {
    /**
     * Name of the tag
     */
    readonly tagName: string;

    /**
     * Attributes on this tag node.
     * Do not modify directly, use attribute API instance methods.
     */
    protected attributes: Map<string, unknown>;

    constructor(tagName: string, attributes?: Map<string, unknown>) {
        super(NodeType.Tag);
        this.tagName = tagName;
        this.attributes = attributes ?? new Map<string, unknown>();
    }

    /**
     * Checks if this tag has a specified attribute
     * @param name Name of the attribute
     */
    hasAttribute(name: string): boolean {
        return this.attributes.has(name);
    }

    /**
     * Gets the value of an attribute, or undefined the attribute does not exist
     * @param name Name of the attribute
     */
    getAttribute(name: string): string | null | undefined {
        const value = this.getRawAttribute(name);
        if (value === undefined) return undefined;
        if (value === null) return null;
        return String(value);
    }

    /**
     * Gets the value of an attribute, or throws an exception if the attribute does not exist
     * @param name Name of the attribute
     */
    getRequiredAttribute(name: string): string | null {
        if (!this.hasAttribute(name)) {
            throw new Error(`Missing required attribute '${name}'`);
        }

        // cannot be undefined, because we check above
        return this.getAttribute(name) as string | null;
    }

    /**
     * Gets the value of an attribute, or throws an exception if the attribute does not exist or the value is null
     * @param name Name of the attribute
     */
    getRequiredValueAttribute(name: string): string {
        const attr: string | null = this.getRequiredAttribute(name);

        if (attr == null) {
            throw new Error(`Missing value for required value attribute '${name}'`);
        }

        return attr;
    }

    /**
     * Gets the value of an attribute, or returns undefined if the attribute does not exist.
     * Throws an exception if attribute value is null.
     * 
     * @param name Name of the attribute
     */
    getOptionalValueAttribute(name: string): string | undefined {
        if (this.hasAttribute(name)) {
            return this.getRequiredValueAttribute(name);
        } else {
            return undefined;
        }
    }

    /**
     * Gets the raw (non-string) value of an attribute. May be any value.
     * @param name Name of the attribute
     */
    getRawAttribute(name: string): unknown {
        return this.attributes.get(name);
    }

    /**
     * Sets the value of an attribute
     * @param name Name of the attribute
     * @param value Value of the attribute
     */
    setAttribute(name: string, value: string | null): void {
        this.attributes.set(name, value);
    }

    /**
     * Sets an attribute to any value, even a non-string
     * @param name Name of the attribute
     * @param value Value of the attribute
     */
    setRawAttribute(name: string, value: unknown): void {
        this.attributes.set(name, value);
    }

    /**
     * Sets the value of a boolean attribute.
     * A boolean attribute has no value, it only exists or does not exist.
     * 
     * @param name Name of the attribute
     * @param value Value of the attribute
     */
    setBooleanAttribute(name: string, value: boolean): void {
        if (value) {
            this.setAttribute(name, null);
        } else {
            this.deleteAttribute(name);
        }
    }

    /**
     * Sets the value of an attribute that cannot be null
     * @param name Name of the attribute
     * @param value Value of the attribute
     */
    setRequiredValueAttribute(name: string, value: string): void {
        this.setAttribute(name, value);
    }

    /**
     * Removes an attribute from this tag
     * @param name Name of the attribute
     */
    deleteAttribute(name: string): void {
        this.attributes.delete(name);
    }

    /**
     * Gets a ReadonlyMap containing all attributes on this tag
     */
    getAttributes(): ReadonlyMap<string, unknown> {
        return this.attributes;
    }

    clone(deep = true, callback?: (oldNode: Node, newNode: Node) => void): TagNode {
        return NodeTools.cloneTagNode(this, deep, callback);
    }

    /**
     * Returns true if a node is an instance of TagNode
     * @param node Node to check
     */
    static isTagNode(node: Node): node is TagNode {
        return node.nodeType === NodeType.Tag;
    }
}

/**
 * A text node
 */
export class TextNode extends NodeWithText {
    constructor(text = '') {
        super(NodeType.Text, text);
    }

    clone(deep?: boolean, callback?: (oldNode: Node, newNode: Node) => void): TextNode {
        return NodeTools.cloneTextNode(this, callback);
    }

    /**
     * Returns true if a node is an instance of TextNode
     * @param node Node to check
     */
    static isTextNode(node: Node): node is TextNode {
        return node.nodeType === NodeType.Text;
    }
}

/**
 * A comment node
 */
export class CommentNode extends NodeWithText {
    constructor(text = '') {
        super(NodeType.Comment, text);
    }

    clone(deep?: boolean, callback?: (oldNode: Node, newNode: Node) => void): CommentNode {
        return NodeTools.cloneCommentNode(this, callback);
    }

    /**
     * Returns true if a node is an instance of CommentNode
     * @param node Node to check
     */
    static isCommentNode(node: Node): node is CommentNode {
        return node.nodeType === NodeType.Comment;
    }
}

/**
 * A CDATA node
 */
export class CDATANode extends NodeWithChildren {
    constructor() {
        super(NodeType.CDATA);
    }

    clone(deep = true, callback?: (oldNode: Node, newNode: Node) => void): CDATANode {
        return NodeTools.cloneCDATANode(this, deep, callback);
    }

    /**
     * Returns true if a node is an instance of CDATANode
     * @param node Node to check
     */
    static isCDATANode(node: Node): node is CDATANode {
        return node.nodeType === NodeType.CDATA;
    }
}

/**
 * A Processing instruction node
 */
export class ProcessingInstructionNode extends NodeWithData {
    /**
     * Name of this processing instruction
     */
    name: string;

    constructor(name = '', data = '') {
        super(NodeType.ProcessingInstruction, data);
        this.name = name;
    }

    clone(deep?: boolean, callback?: (oldNode: Node, newNode: Node) => void): ProcessingInstructionNode {
        return NodeTools.cloneProcessingInstructionNode(this, callback);
    }

    /**
     * Returns true if a node is an instance of ProcessingInstructionNode
     * @param node Node to check
     */
    static isProcessingInstructionNode(node: Node): node is ProcessingInstructionNode {
        return node.nodeType === NodeType.ProcessingInstruction;
    }
}

/**
 * A document node
 */
export class DocumentNode extends NodeWithChildren {
    constructor() {
        super(NodeType.Document);
    }

    setRootScope(rootScope: Record<PropertyKey, unknown> | null): void {
        Object.setPrototypeOf(this.nodeData, rootScope);
    }

    clone(deep = true, callback?: (oldNode: Node, newNode: Node) => void): DocumentNode {
        return NodeTools.cloneDocumentNode(this, deep, callback);
    }

    /**
     * Returns true if a node is an instance of DocumentNode
     * @param node Node to check
     */
    static isDocumentNode(node: Node): node is DocumentNode {
        return node.nodeType === NodeType.Document;
    }
}

/**
 * Parent type for any custom tag that includes an external reference
 */
export abstract class ExternalReferenceNode extends TagNode {
    constructor(tagName: string, src: string, attributes?: Map<string, unknown>) {
        super(tagName, attributes);

        this.setAttribute('src', src);
    }

    /**
     * Parameters to the external reference.
     */
    get parameters(): ReadonlyMap<string, unknown> {
        const params: Map<string, unknown> = new Map();

        // extract fragment params
        for (const entry of this.attributes) {
            const key: string = entry[0];
            const value: unknown = entry[1];

            if (key != 'src' && value != null) {
                params.set(key, value);
            }
        
        }

        return params;
    }

    /**
     * Path to the source of the external reference
     */
    get src(): string {
        return this.getRequiredValueAttribute('src');
    }
    set src(newSrc: string) {
        this.setAttribute('src', newSrc);
    }

    abstract clone(deep: boolean, callback?: (oldNode: Node, newNode: Node) => void): ExternalReferenceNode;
}

/**
 * m-fragment tag
 */
export class MFragmentNode extends ExternalReferenceNode {
    constructor(src: string, attributes?: Map<string, unknown>) {
        super('m-fragment', src, attributes);
    }

    clone(deep = true, callback?: (oldNode: Node, newNode: Node) => void): MFragmentNode {
        return NodeTools.cloneMFragmentNode(this, deep, callback);
    }

    /**
     * Returns true if a node is an instance of MFragmentNode
     * @param node Node to check
     */
    static isMFragmentNode(node: Node): node is MFragmentNode {
        return TagNode.isTagNode(node) && node.tagName === 'm-fragment';
    }
}

/**
 * m-component tag
 */
export class MComponentNode extends ExternalReferenceNode {
    constructor(src: string, attributes?: Map<string, unknown>) {
        super('m-component', src, attributes);
    }

    clone(deep = true, callback?: (oldNode: Node, newNode: Node) => void): MComponentNode {
        return NodeTools.cloneMComponentNode(this, deep, callback);
    }

    /**
     * Returns true if a node is an instance of MComponentNode
     * @param node Node to check
     */
    static isMComponentNode(node: Node): node is MComponentNode {
        return TagNode.isTagNode(node) && node.tagName === 'm-component';
    }
}

/**
 * Parent type for any custom tag that refers to a slot
 */
export abstract class SlotReferenceNode extends TagNode {
    constructor(tagName: string, slot?: string, attributes?: Map<string, unknown>) {
        super(tagName, attributes);

        // populate slot name if missing
        this.setAttribute('slot', slot ?? '[default]');
    }

    // must be dynamic to reflect attribute changes
    /**
     * Name of the slot
     */
    get slot(): string {
        return this.getRequiredValueAttribute('slot')
    }
    set slot(newSlotName: string) {
        this.setAttribute('slot', newSlotName);
    }

    abstract clone(deep: boolean, callback?: (oldNode: Node, newNode: Node) => void): SlotReferenceNode;
}

/**
 * m-content tag
 */
export class MContentNode extends SlotReferenceNode {
    constructor(slot?: string, attributes?: Map<string, unknown>) {
        super('m-content', slot, attributes);
    }

    clone(deep = true, callback?: (oldNode: Node, newNode: Node) => void): MContentNode {
        return NodeTools.cloneMContentNode(this, deep, callback);
    }

    /**
     * Returns true if a node is an instance of MContentNode
     * @param node Node to check
     */
    static isMContentNode(node: Node): node is MContentNode {
        return TagNode.isTagNode(node) && node.tagName === 'm-content';
    }
}

/**
 * m-slot tag
 */
export class MSlotNode extends SlotReferenceNode {
    constructor(slot?: string, attributes?: Map<string, unknown>) {
        super('m-slot', slot, attributes);
    }

    clone(deep = true, callback?: (oldNode: Node, newNode: Node) => void): MSlotNode {
        return NodeTools.cloneMSlotNode(this, deep, callback);
    }

    /**
     * Returns true if a node is an instance of MSlotNode
     * @param node Node to check
     */
    static isMSlotNode(node: Node): node is MSlotNode {
        return TagNode.isTagNode(node) && node.tagName === 'm-slot';
    }
}

/**
 * Parent type for any tag that defines variables
 */
export abstract class VariablesNode extends TagNode {
    constructor(tagName: string, attributes?: Map<string, unknown>) {
        super(tagName, attributes);
    }

    /**
     * Local Variables defined on this <m-var> tag
     */
    get variables(): ReadonlyMap<string, unknown> {
        const vars: Map<string, unknown> = new Map();

        // extract variables
        for (const entry of this.attributes) {
            const key: string = entry[0];
            const value: unknown = entry[1];

            if (value != null) {
                vars.set(key, value);
            }
        }

        return vars;
    }
}

/**
 * m-var tag
 */
export class MVarNode extends VariablesNode {
    constructor(attributes?: Map<string, unknown>) {
        super('m-var', attributes);
    }

    clone(deep = true, callback?: (oldNode: Node, newNode: Node) => void): MVarNode {
        return NodeTools.cloneMVarNode(this, deep, callback);
    }

    /**
     * Returns true if a node is an instance of MVarNode
     * @param node Node to check
     */
    static isMVarNode(node: Node): node is MVarNode {
        return TagNode.isTagNode(node) && node.tagName === 'm-var';
    }
}

/**
 * m-scope tag
 */
export class MScopeNode extends VariablesNode {
    constructor(attributes?: Map<string, unknown>) {
        super('m-scope', attributes);
    }

    clone(deep = true, callback?: (oldNode: Node, newNode: Node) => void): MScopeNode {
        return NodeTools.cloneMScopeNode(this, deep, callback);
    }

    /**
     * Returns true if a node is an instance of MScopeNode
     * @param node Node to check
     */
    static isMScopeNode(node: Node): node is MScopeNode {
        return TagNode.isTagNode(node) && node.tagName === 'm-scope';
    }
}

/**
 * m-import tag
 */
export class MImportNode extends TagNode {
    constructor(src: string, as: string, fragment: boolean, component: boolean, attributes?: Map<string, unknown>) {
        super('m-import', attributes);

        this.setAttribute('src', src);
        this.setAttribute('as', as);
        this.setBooleanAttribute('fragment', fragment);
        this.setBooleanAttribute('component', component);
    }

    /**
     * Path to the import source
     */
    get src(): string {
        return this.getRequiredValueAttribute('src');
    }
    set src(newSrc: string) {
        this.setAttribute('src', newSrc);
    }

    /**
     * Alias for the import
     */
    get as(): string {
        return this.getRequiredValueAttribute('as');
    }
    set as(newAs: string) {
        this.setAttribute('as', newAs);
    }

    /**
     * If true, this is a fragment import
     */
    get fragment(): boolean {
        return this.hasAttribute('fragment');
    }
    set fragment(newFragment: boolean) {
        this.setBooleanAttribute('fragment', newFragment);
    }

    /**
     * If true, this is a component import
     */
    get component(): boolean {
        return this.hasAttribute('component');
    }
    set component(newComponent: boolean) {
        this.setBooleanAttribute('component', newComponent);
    }

    clone(deep = true, callback?: (oldNode: Node, newNode: Node) => void): MImportNode {
        return NodeTools.cloneMImportNode(this, deep, callback);
    }

    /**
     * Returns true if a node is an instance of MImportNode
     * @param node Node to check
     */
    static isMImportNode(node: Node): node is MImportNode {
        return TagNode.isTagNode(node) && node.tagName === 'm-import';
    }
}

/**
 * Parent class for any Tag that contains a conditional <m-if>, <m-else-if>, etc.
 */
export abstract class ConditionalNode extends TagNode {
    constructor(tagName: string, expression: unknown, attributes?: Map<string, unknown>) {
        super(tagName, attributes);

        this.setRawAttribute('?', expression);
    }

    /**
     * TODO document
     */
    get condition(): boolean {
        return !!this.getRawAttribute('?');
    }
    set condition(newCondition: boolean) {
        this.setRawAttribute('?', newCondition);
    }

    
    /**
     * TODO document
     */
    get expression(): string {
        return this.getRequiredValueAttribute('?');
    }
    set expression(newExp: string) {
        this.setAttribute('?', newExp);
    }

    abstract get prevConditional(): ConditionalNode | null;
    abstract get nextConditional(): ConditionalNode | null;
}

/**
 * TODO document
 */
export class MIfNode extends ConditionalNode {
    constructor(expression: unknown, attributes?: Map<string, unknown>) {
        super('m-if', expression, attributes);
    }

    get prevConditional(): null {
        return null;
    }

    get nextConditional(): ConditionalNode | null {
        const nextTag = this.nextSiblingTag;
        if (nextTag != null && (MElseIfNode.isMElseIfNode(nextTag) || MElseNode.isMElseNode(nextTag))) {
            return nextTag;
        } else {
            return null;
        }
    }

    clone(deep = true, callback?: (oldNode: Node, newNode: Node) => void): MIfNode {
        return NodeTools.cloneMIfNode(this, deep, callback);
    }

    /**
     * Returns true if a node is an instance of MIfNode
     * @param node Node to check
     */
    static isMIfNode(node: Node): node is MIfNode {
        return TagNode.isTagNode(node) && node.tagName === 'm-if';
    }
}


/**
 * TODO document
 */
export class MElseIfNode extends ConditionalNode {
    constructor(expression: unknown, attributes?: Map<string, unknown>) {
        super('m-else-if', expression, attributes);
    }

    get prevConditional(): ConditionalNode | null {
        const prevTag = this.prevSiblingTag;
        if (prevTag != null && (MIfNode.isMIfNode(prevTag) || MElseIfNode.isMElseIfNode(prevTag))) {
            return prevTag;
        } else {
            return null;
        }
    }

    get nextConditional(): ConditionalNode | null {
        const nextTag = this.nextSiblingTag;
        if (nextTag != null && (MElseIfNode.isMElseIfNode(nextTag) || MElseNode.isMElseNode(nextTag))) {
            return nextTag;
        } else {
            return null;
        }
    }


    clone(deep = true, callback?: (oldNode: Node, newNode: Node) => void): MElseIfNode {
        return NodeTools.cloneMElseIfNode(this, deep, callback);
    }

    /**
     * Returns true if a node is an instance of MElseIfNode
     * @param node Node to check
     */
    static isMElseIfNode(node: Node): node is MElseIfNode {
        return TagNode.isTagNode(node) && node.tagName === 'm-else-if';
    }
}

/**
 * TODO document
 */
export class MElseNode extends ConditionalNode {
    constructor(attributes?: Map<string, unknown>) {
        super('m-else', true, attributes);
    }

    get prevConditional(): ConditionalNode | null {
        const prevTag = this.prevSiblingTag;
        if (prevTag != null && (MIfNode.isMIfNode(prevTag) || MElseIfNode.isMElseIfNode(prevTag))) {
            return prevTag;
        } else {
            return null;
        }
    }

    get nextConditional(): null {
        return null;
    }

    clone(deep = true, callback?: (oldNode: Node, newNode: Node) => void): MElseNode {
        return NodeTools.cloneMElseNode(this, deep, callback);
    }

    /**
     * Returns true if a node is an instance of MElseNode
     * @param node Node to check
     */
    static isMElseNode(node: Node): node is MElseNode {
        return TagNode.isTagNode(node) && node.tagName === 'm-else';
    }
}

/**
 * Base class for m-for tags
 */
export abstract class MForNode extends TagNode {
    /**
     * Name of the attribute that stores the expression for this <m-for>
     */
    readonly expressionAttrName: string;

    constructor(expressionAttrName: string, expression: unknown, varName: string, indexName: string | undefined, attributes?: Map<string, unknown>) {
        super('m-for', attributes);
        this.expressionAttrName = expressionAttrName;

        this.setRawAttribute(expressionAttrName, expression);

        this.setAttribute('var', varName);

        if (indexName != undefined) {
            this.setAttribute('index', indexName);
        } else {
            this.deleteAttribute('index');
        }
    }

    /**
     * The raw value of the expression in this <m-for>.
     * If this node has been processed by TemplateTextModule, then this will be the array or object to iterate.
     * Otherwise, it will be the uncompiled string expression.
     */
    get expression(): unknown {
        return this.getRawAttribute(this.expressionAttrName);
    }
    set expression(newOf: unknown) {
        this.setRawAttribute(this.expressionAttrName, newOf);
    }

    /**
     * Name of the variable binding
     */
    get varName(): string {
        return this.getRequiredValueAttribute('var');
    }
    set varName(newVar: string) {
        this.setAttribute('var', newVar);
    }

    /**
     * Name of the index binding
     */
    get indexName(): string | undefined {
        return this.getOptionalValueAttribute('index');
    }
    set indexName(newIndexName: string | undefined) {
        if (newIndexName != undefined) {
            this.setAttribute('index', newIndexName);
        } else {
            this.deleteAttribute('index');
        }
    }

    /**
     * Returns true if a node is an instance of MForNode
     * @param node Node to check
     */
    static isMForNode(node: Node): node is MForNode {
        return TagNode.isTagNode(node) && node.tagName === 'm-for';
    }
}


/**
 * Variant of <m-for> that implements a for...of loop
 */
export class MForOfNode extends MForNode {
    constructor(expression: unknown, varName: string, indexName: string | undefined, attributes?: Map<string, unknown>) {
        super('of', expression, varName, indexName, attributes);
    }

    clone(deep = true, callback?: (oldNode: Node, newNode: Node) => void): MForOfNode {
        return NodeTools.cloneMForOfNode(this, deep, callback);
    }

    /**
     * Returns true if a node is an MForNode using a for...of expression
     * @param node Node to check
     */
    static isMForOfNode(node: Node): node is MForOfNode {
        return MForNode.isMForNode(node) && node.expressionAttrName === 'of';
    }
}


/**
 * Variant of <m-for> that implements a for...in loop
 */
export class MForInNode extends MForNode {
    constructor(expression: unknown, varName: string, indexName: string | undefined, attributes?: Map<string, unknown>) {
        super('in', expression, varName, indexName, attributes);
    }

    clone(deep = true, callback?: (oldNode: Node, newNode: Node) => void): MForInNode {
        return NodeTools.cloneMForInNode(this, deep, callback);
    }

    /**
     * Returns true if a node is an MForNode using a for...in expression
     * @param node Node to check
     */
    static isMForInNode(node: Node): node is MForInNode {
        return MForNode.isMForNode(node) && node.expressionAttrName === 'in';
    }
}
import * as NodeLogic from './nodeLogic';
import { MimeType } from '..';

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
     * Do not modify this directly, use NodeLogic or instance methods.
     */
    parentNode: NodeWithChildren | null = null;

    /**
     * Previous sibling node, or null if none exists.
     * Do not modify this directly, use NodeLogic or instance methods.
     */
    prevSibling: Node | null = null;

    /**
     * Next sibling node, or null if none exists.
     * Do not modify this directly, use NodeLogic or instance methods.
     */
    nextSibling: Node | null = null;

    /**
     * The closest previous sibling that is a TagNode, or null if none exists.
     * Do not modify this directly, use NodeLogic or instance methods.
     */
    get prevSiblingTag(): TagNode | null {
        return NodeLogic.getPreviousTag(this);
    }

    /**
     * The closest following sibling that is a TagNode, or null if none exists.
     * Do not modify this directly, use NodeLogic or instance methods.
     */
    get nextSiblingTag(): TagNode | null {
        return NodeLogic.getNextTag(this);
    }

    /**
     * Extra DOM data associated with this node.
     * This object prototypically inherits from the parent node's nodeData.
     */
    readonly nodeData: Record<PropertyKey, unknown> = {};

    /**
     * Creates a new Node
     * @param nodeType Type of this node
     */
    constructor(nodeType: NodeType) {
        this.nodeType = nodeType;
    }

    /**
     * Inserts a sibling node after this one
     * @param node Node to insert
     */
    appendSibling(node: Node): void {
        NodeLogic.appendSibling(node, this);
    }

    /**
     * Inserts a sibling node before this one
     * @param node Node to insert
     */
    prependSibling(node: Node): void {
        NodeLogic.prependSibling(node, this);
    }

    /**
     * Remove this node and all children from the DOM
     */
    removeSelf(): void {
        NodeLogic.detachNode(this);
    }
    
    /**
     * Remove this node and all children from the DOM, and insert one or more nodes in its place
     * @param nodes Nodes to insert in replacement. Can be empty.
     */
    replaceSelf(nodes: Node[]): void {
        NodeLogic.replaceNode(this, nodes);
    }

    /**
     * Clone this node
     * @param deep If true, child nodes will be cloned
     * @param callback Optional callback for each node after cloning
     * @returns The generated clone
     */
    abstract clone(deep?: boolean, callback?: (oldNode: Node, newNode: Node) => void): Node;

    /**
     * Serializes this node into HTML.
     * Child nodes will be automatically serialize.
     * 
     * @returns HTML text representation of this node
     */
    toHtml(): string {
        return NodeLogic.serializeNode(this);
    }
}

/**
 * Base type for any type of node that can have children
 */
export abstract class NodeWithChildren extends Node {
    /**
     * Children of this node.
     * Do not modify this directly, use NodeLogic or instance methods.
     */
    childNodes: Node[] = [];

    /**
     * The first child node of this parent, or null if there are no children.
     */
    get firstChild(): Node | null {
        return NodeLogic.getFirstNode(this.childNodes);
    }

    /**
     * The last child node of this parent, or null if there are no children.
     */
    get lastChild(): Node | null {
        return NodeLogic.getLastNode(this.childNodes);
    }

    /**
     * Gets all child TagNodes from this parent
     * @returns array of TagNodes containing all child tags
     */
    getChildTags(): TagNode[] {
        return NodeLogic.getChildTags(this);
    }
    
    /**
     * Inserts a child at the end of this parent's children
     * @param child Node to insert
     */
    appendChild(child: Node): void {
        NodeLogic.appendChild(this, child);
    }

    /**
     * Inserts a child at the start of this parent's children
     * @param child Node to insert
     */
    prependChild(child: Node): void {
        NodeLogic.prependChild(this, child);
    }
    
    /**
     * Removes all children from this node
     */
    clear(): void {
        NodeLogic.clear(this);
    }

    /**
     * Append multiple children to the end of this parent's child list
     * @param children Child nodes to append. Can be empty.
     */
    appendChildren(children: Node[]): void {
        NodeLogic.appendChildNodes(this, children);
    }

    /**
     * Prepend multiple children to the start of this parent's child list
     * @param children Child nodes to prepend. Can be empty.
     */
    prependChildren(children: Node[]): void {
        NodeLogic.prependChildNodes(this, children);
    }

    /**
     * Finds the first child node that matches a condition.
     * Returns null if no match found.
     * @param matcher Callback to test condition
     * @param deep If true, children of child nodes will also be searched.
     * @returns First matching child, or null
     */
    findChildNode(matcher: (node: Node) => boolean, deep = true): Node | null {
        return NodeLogic.findChildNode(this, matcher, deep);
    }

    /**
     * Finds all child nodes that match a condition.
     * Returns an empty array if no matches found.
     * @param matcher Callback to test condition
     * @param deep If true, children of child nodes will also be searched.
     * @returns Array of all Nodes that match condition
     */
    findChildNodes(matcher: (node: Node) => boolean, deep = true): Node[] {
        return NodeLogic.findChildNodes(this, matcher, deep);
    }

    /**
     * Finds the first child TagNode that matches a condition.
     * Returns null if no match found.
     * @param matcher Callback to test condition
     * @param deep If true, children of child nodes will also be searched.
     * @returns First TagNode that matches the condition, or null.
     */
    findChildTag(matcher: (tag: TagNode) => boolean, deep = true): TagNode | null {
        return NodeLogic.findChildTag(this, matcher, deep);
    }

    /**
     * Finds all child TagNodes that match a condition.
     * Returns an empty array if no matches found.
     * @param matcher Callback to test condition
     * @param deep If true, children of child nodes will also be searched.
     * @returns Array of all TagNodes that match condition
     */
    findChildTags(matcher: (tag: TagNode) => boolean, deep = true): TagNode[] {
        return NodeLogic.findChildTags(this, matcher, deep);
    }

    /**
     * Finds the first child node of a specified type.
     * Returns null if none found.
     * @param nodeType Type of node to match
     * @param deep If true, children of child nodes will also be searched.
     * @returns The first node that matches, or null
     */
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

    /**
     * Finds all child nodes of a specified type.
     * @param nodeType Type of node to match
     * @param deep If true, children of child nodes will also be searched.
     * @returns Array of all matching child nodes
     */
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

    /**
     * Finds the first child TagNode with the specified tag name.
     * Result may be a subclass of TagNode if a custom tag type is specified.
     * Returns null if none found.
     * @param tagName Tag name to match
     * @param deep If true, children of child nodes will also be searched.
     * @returns First matching TagNode, or null.
     */
    findChildTagByTagName(tagName: 'm-fragment', deep?: boolean): MFragmentNode | null;
    findChildTagByTagName(tagName: 'm-content', deep?: boolean): MContentNode | null;
    findChildTagByTagName(tagName: 'm-slot', deep?: boolean): MSlotNode | null;
    findChildTagByTagName(tagName: 'm-var', deep?: boolean): MVarNode | null;
    findChildTagByTagName(tagName: 'm-scope', deep?: boolean): MScopeNode | null;
    findChildTagByTagName(tagName: 'm-import', deep?: boolean): MImportNode | null;
    findChildTagByTagName(tagName: 'm-if', deep?: boolean): MIfNode | null;
    findChildTagByTagName(tagName: 'm-for', deep?: boolean): MForNode | null;
    findChildTagByTagName(tagName: 'm-data', deep?: boolean): MDataNode | null;
    findChildTagByTagName(tagName: 'style', deep?: boolean): StyleNode | null;
    findChildTagByTagName(tagName: 'script', deep?: boolean): ScriptNode | null;
    findChildTagByTagName(tagName: string, deep?: boolean): TagNode | null;
    findChildTagByTagName(tagName: string, deep = true): TagNode | null {
        return this.findChildTag(tag => tag.tagName === tagName, deep);
    }

    /**
     * Finds all child TagNodes with the specified tag name.
     * Results may be a subclass of TagNode if a custom tag type is specified.
     * Returns null if none found.
     * @param tagName Tag name to match
     * @param deep If true, children of child nodes will also be searched.
     * @returns Array of all matching TagNodes
     */
    findChildTagsByTagName(tagName: 'm-fragment', deep?: boolean): MFragmentNode[];
    findChildTagsByTagName(tagName: 'm-content', deep?: boolean): MContentNode[];
    findChildTagsByTagName(tagName: 'm-slot', deep?: boolean): MSlotNode[];
    findChildTagsByTagName(tagName: 'm-var', deep?: boolean): MVarNode[];
    findChildTagsByTagName(tagName: 'm-scope', deep?: boolean): MScopeNode[];
    findChildTagsByTagName(tagName: 'm-import', deep?: boolean): MImportNode[];
    findChildTagsByTagName(tagName: 'm-if', deep?: boolean): MIfNode[];
    findChildTagsByTagName(tagName: 'm-for', deep?: boolean): MForNode[];
    findChildTagsByTagName(tagName: 'm-data', deep?: boolean): MDataNode[];
    findChildTagsByTagName(tagName: 'style', deep?: boolean): StyleNode[];
    findChildTagsByTagName(tagName: 'script', deep?: boolean): ScriptNode[];
    findChildTagsByTagName(tagName: string, deep?: boolean): TagNode[];
    findChildTagsByTagName(tagName: string, deep = true): TagNode[] {
        return this.findChildTags(tag => tag.tagName === tagName, deep);
    }

    /**
     * Removes all children from this node and creates a new DocumentNode containing them.
     * @returns the created DocumentNode
     */
    createDomFromChildren(): DocumentNode {
        return NodeLogic.createDomFromChildren(this);
    }

    /**
     * Removes this node from the DOM, but optionally preserves children.
     * If keepChildren is true, then child nodes will be reattached to the DOM in place of this node.
     * Effectively "promotes" child nodes.
     * @param keepChildren If true, child nodes will be kept.
     */
    removeSelf(keepChildren = false): void {
        if (keepChildren) {
            NodeLogic.replaceNode(this, this.childNodes);
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

    /**
     * Creates a new NodeWithText
     * @param nodeType Type of node, for Node() constructor
     * @param text Content of this NodeWithText
     */
    protected constructor(nodeType: NodeType, text: string) {
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

    /**
     * Creates a new NodeWithData
     * @param nodeType Type of node, for Node() constructor
     * @param data Content of this NodeWithData
     */
    protected constructor(nodeType: NodeType, data: string) {
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

    /**
     * Creates a new TagNode
     * @param tagName Type of tag
     * @param attributes Optional Map of attributes to initialize this tag with
     */
    constructor(tagName: string, attributes?: Map<string, unknown>) {
        super(NodeType.Tag);
        this.tagName = tagName;
        this.attributes = attributes ?? new Map<string, unknown>();
    }

    /**
     * Checks if this tag has a specified attribute
     * @param name Name of the attribute
     * @returns True if the attribute exists, false otherwise
     */
    hasAttribute(name: string): boolean {
        return this.attributes.has(name);
    }

    /**
     * Gets the value of an attribute, or undefined the attribute does not exist
     * @param name Name of the attribute
     * @returns Value of the attribute, converted to a string if not null or undefined
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
     * @returns Value of the attribute, converted to a string if not null
     * @throws If the attribute does not exist
     */
    getRequiredAttribute(name: string): string | null {
        if (!this.hasAttribute(name)) {
            throw new Error(`Missing required attribute '${ name }'`);
        }

        // cannot be undefined, because we check above
        return this.getAttribute(name) as string | null;
    }

    /**
     * Gets the value of an attribute, or throws an exception if the attribute does not exist or the value is null
     * @param name Name of the attribute
     * @returns Value of the attribute, converted to a string
     * @throws If the attribute does not exist
     * @throws If the attribute is null
     */
    getRequiredValueAttribute(name: string): string {
        const attr: string | null = this.getRequiredAttribute(name);

        if (attr == null) {
            throw new Error(`Missing value for required value attribute '${ name }'`);
        }

        return attr;
    }

    /**
     * Gets the value of an attribute, or returns undefined if the attribute does not exist.
     * Throws an exception if attribute value is null.
     * 
     * @param name Name of the attribute
     * @returns Value of the attribute (converted to a string) or undefined if it does not exist
     * @throws If the attribute exists but is null
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
     * @returns Raw value of the attribute
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
        this.setRawAttribute(name, value);
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
     * Gets a ReadonlyMap containing all attributes on this tag.
     * Attributes are exposed raw - not converted to strings.
     * @returns a read-only Map containing all attributes
     */
    getAttributes(): ReadonlyMap<string, unknown> {
        return this.attributes;
    }

    clone(deep = true, callback?: (oldNode: Node, newNode: Node) => void): TagNode {
        return NodeLogic.cloneTagNode(this, deep, callback);
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
    /**
     * Create a new TextNode
     * @param text Optional text to initialize with. Defaults to an empty string
     */
    constructor(text = '') {
        super(NodeType.Text, text);
    }

    clone(deep?: boolean, callback?: (oldNode: Node, newNode: Node) => void): TextNode {
        return NodeLogic.cloneTextNode(this, callback);
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
 * An HTML comment.
 */
export class CommentNode extends NodeWithText {
    /**
     * Create a new comment node
     * @param text Optional comment text to initialize with
     */
    constructor(text = '') {
        super(NodeType.Comment, text);
    }

    clone(deep?: boolean, callback?: (oldNode: Node, newNode: Node) => void): CommentNode {
        return NodeLogic.cloneCommentNode(this, callback);
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
        return NodeLogic.cloneCDATANode(this, deep, callback);
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

    /**
     * Creates a new Processing Instruction
     * @param name Name value
     * @param data Data value
     */
    constructor(name = '', data = '') {
        super(NodeType.ProcessingInstruction, data);
        this.name = name;
    }

    clone(deep?: boolean, callback?: (oldNode: Node, newNode: Node) => void): ProcessingInstructionNode {
        return NodeLogic.cloneProcessingInstructionNode(this, callback);
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
 * A document node.
 * Is a "root" node, so it cannot have a parent.
 * DOM trees are not required to have a DocumentNode root, but it exists as a utility to make DOM processing easier.
 */
export class DocumentNode extends NodeWithChildren {
    constructor() {
        super(NodeType.Document);
    }

    /**
     * Set the root scope of this DOM.
     * The root scope is inherited by all nodes, but is read-only.
     * @param rootScope Scope object to inherit from
     */
    setRootScope(rootScope: Record<PropertyKey, unknown> | null): void {
        Object.setPrototypeOf(this.nodeData, rootScope);
    }

    clone(deep = true, callback?: (oldNode: Node, newNode: Node) => void): DocumentNode {
        return NodeLogic.cloneDocumentNode(this, deep, callback);
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
 * Implements <m-fragment> tag.
 * MFragmentNode defines a reference to an external HTML fragment.
 * This node will be replaced with the compiled, plain HTML form of the external fragment.
 */
export class MFragmentNode extends TagNode {
    /**
     * Create a new MFragmentNode
     * @param src Path to fragment
     * @param attributes Optional attributes
     */
    constructor(src: string, attributes?: Map<string, unknown>) {
        super('m-fragment', attributes);

        this.src = src;
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

    clone(deep = true, callback?: (oldNode: Node, newNode: Node) => void): MFragmentNode {
        return NodeLogic.cloneMFragmentNode(this, deep, callback);
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
 * Parent type for any custom tag that refers to a slot.
 * Slot name is stored in the "slot" attribute and defaults to "[default]".
 */
export abstract class SlotReferenceNode extends TagNode {
    /**
     * Creates a new SlotReferenceNode
     * @param tagName Tag name of the implementing node
     * @param slot Name of the slot
     * @param attributes Optional attributes
     */
    protected constructor(tagName: string, slot?: string, attributes?: Map<string, unknown>) {
        super(tagName, attributes);

        // populate slot name if missing
        this.setAttribute('slot', slot ?? '[default]');
    }

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
 * <m-content> tag.
 * MContentNode defines content that should be placed into a slot when compiling an external reference.
 */
export class MContentNode extends SlotReferenceNode {
    /**
     * Creates a new MSlotNode
     * @param slot Optional name of target slot
     * @param attributes Optional attributes
     */
    constructor(slot?: string, attributes?: Map<string, unknown>) {
        super('m-content', slot, attributes);
    }

    clone(deep = true, callback?: (oldNode: Node, newNode: Node) => void): MContentNode {
        return NodeLogic.cloneMContentNode(this, deep, callback);
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
 * <m-slot> tag.
 * Defines a slot that can receive a DOM subtree from <m-content>
 */
export class MSlotNode extends SlotReferenceNode {
    /**
     * Creates a new MSlotNode
     * @param slot Optional slot name
     * @param attributes Optional attributes
     */
    constructor(slot?: string, attributes?: Map<string, unknown>) {
        super('m-slot', slot, attributes);
    }

    clone(deep = true, callback?: (oldNode: Node, newNode: Node) => void): MSlotNode {
        return NodeLogic.cloneMSlotNode(this, deep, callback);
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
 * <m-var> tag.
 * Defines local variables that are inserted into the parent node's scope instead of this node's scope.
 * Effectively defines variables for its following siblings rather than its children.
 */
export class MVarNode extends TagNode {
    /**
     * Create a new MVarNode
     * @param attributes Optional attributes to convert to variables
     */
    constructor(attributes?: Map<string, unknown>) {
        super('m-var', attributes);
    }

    clone(deep = true, callback?: (oldNode: Node, newNode: Node) => void): MVarNode {
        return NodeLogic.cloneMVarNode(this, deep, callback);
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
 * <m-scope> tag.
 * Defines variables that are added to this node's scope, and therefore available only to child nodes.
 * Enables the concept of a "local scope".
 */
export class MScopeNode extends TagNode {
    /**
     * Create a new MScopeNode
     * @param attributes Optional attributes
     */
    constructor(attributes?: Map<string, unknown>) {
        super('m-scope', attributes);
    }

    clone(deep = true, callback?: (oldNode: Node, newNode: Node) => void): MScopeNode {
        return NodeLogic.cloneMScopeNode(this, deep, callback);
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
 * <m-import> tag.
 * Defines a shorthand "alias" to an external reference.
 * The "as" attribute specifies the tag name that will become an alias for this import.
 * The "src" attribute specifies the path to the external reference.
 * MImportNode registers imports into the parent scope, like MVarNode.
 */
export class MImportNode extends TagNode {
    /**
     * Creates a new MImportNode.
     * @param src Path to reference
     * @param as Tag name to use as alias
     * @param attributes Optional attributes.
     */
    constructor(src: string, as: string, attributes?: Map<string, unknown>) {
        super('m-import', attributes);
        
        this.src = src;
        this.as = as;
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


    clone(deep = true, callback?: (oldNode: Node, newNode: Node) => void): MImportNode {
        return NodeLogic.cloneMImportNode(this, deep, callback);
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
 * The conditional value is stored in the ? attribute.
 */
export abstract class ConditionalNode extends TagNode {
    /**
     * Creates a new ConditionalNode
     * @param tagName Tag name of implementing node
     * @param condition Conditional value, or a string to be compiled into a conditional value
     * @param attributes Optional attributes
     */
    protected constructor(tagName: string, condition: unknown, attributes?: Map<string, unknown>) {
        super(tagName, attributes);

        this.setRawAttribute('?', condition);
    }

    /**
     * The raw value of the conditional in this conditional.
     * If this node has been processed by TemplateTextModule, then this can be any value.
     * Otherwise, it will be the uncompiled string expression.
     */
    get condition(): unknown {
        return this.getRawAttribute('?');
    }
    set condition(newCondition: unknown) {
        this.setRawAttribute('?', newCondition);
    }

    /**
     * If the conditional has been compiled, then this is the conditional value coerced into a boolean.
     * If not compiled, then this will true if a conditional expression exists and false if not.
     */
    get isTruthy(): boolean {
        return !!this.condition;
    }

    /**
     * Gets the preceding conditional node, if it exists.
     * This respects the conditional's ordering rules.
     */
    abstract get prevConditional(): ConditionalNode | null;

    /**
     * Gets the following conditional node, if it exists.
     * This respects the conditional's ordering rules.
     */
    abstract get nextConditional(): ConditionalNode | null;
}

/**
 * <m-if> node. This is a conditional that selectively compiles or deletes it's contents based on a conditional expression.
 * An <m-if> node can have no preceding conditionals, but may have an <m-else-if> or an <m-else> as a following node.
 */
export class MIfNode extends ConditionalNode {
    /**
     * Creates a new MIfNode
     * @param condition Conditional value
     * @param attributes Optional attributes
     */
    constructor(condition: unknown, attributes?: Map<string, unknown>) {
        super('m-if', condition, attributes);
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
        return NodeLogic.cloneMIfNode(this, deep, callback);
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
 * <m-else-if> node. Like <m-if>, this conditional will only render its content if its condition is true.
 * However, there is an additional constraint that an <m-else-if> node will only render if all preceding <m-if> and <m-else-if> nodes evaluate to false.
 * An <m-else-if> node can be preceded by <m-if> or <m-else-if>, and followed by <m-else> and <m-else-if>.
 */
export class MElseIfNode extends ConditionalNode {
    /**
     * Creates a new MElseIfNode
     * @param condition Conditional value
     * @param attributes Optional attributes
     */
    constructor(condition: unknown, attributes?: Map<string, unknown>) {
        super('m-else-if', condition, attributes);
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
        return NodeLogic.cloneMElseIfNode(this, deep, callback);
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
 * <m-else> node. This is a conditional that always evaluates to true.
 * However, like <m-else-if> there is an additional constraint that an <m-else> node will only render if all preceding <m-if> and <m-else-if> nodes evaluate to false.
 * An <m-else> node can have no following conditionals, but may have an <m-else-if> or an <m-if> as a preceding node.
 */
export class MElseNode extends ConditionalNode {
    /**
     * Create a new MElseNode
     * @param attributes Optional attributes
     */
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
        return NodeLogic.cloneMElseNode(this, deep, callback);
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
 * Base class for <m-for> tags.
 * MForNode implements a for loop.
 * An expression is evaluated, and for each resulting value the child nodes are repeated.
 * Each copy is compiled with the current iteration value and index exposed through specified variables.
 * The "var" attribute contains the name of the variable containing the iteration value.
 * The "index" attribute optionally contains the name of the variable to hold the iteration index.
 */
export abstract class MForNode extends TagNode {
    /**
     * Name of the attribute that stores the expression for this <m-for>
     */
    readonly expressionAttrName: string;

    /**
     * Create a new MForNode
     * @param expressionAttrName Name of the attribute that contains the expression
     * @param expression Value of the expression
     * @param varName Name of the variable to store the current iteration value
     * @param indexName Optional name of the variable to store the current iteration index.
     * @param attributes Optional attributes
     */
    protected constructor(expressionAttrName: string, expression: unknown, varName: string, indexName: string | undefined, attributes?: Map<string, unknown>) {
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
 * Expression is stored in the "of" attribute.
 */
export class MForOfNode extends MForNode {
    /**
     * Create a new MForOfLoop
     * @param expression Expression that is or evaluates to an array-like object
     * @param varName Name of variable to store the current value
     * @param indexName Name of variable to store the current index
     * @param attributes Optional attributes
     */
    constructor(expression: unknown, varName: string, indexName: string | undefined, attributes?: Map<string, unknown>) {
        super('of', expression, varName, indexName, attributes);
    }

    clone(deep = true, callback?: (oldNode: Node, newNode: Node) => void): MForOfNode {
        return NodeLogic.cloneMForOfNode(this, deep, callback);
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
 * Variant of <m-for> that implements a for...in loop.
 * Expression is stored in the "in" attribute.
 */
export class MForInNode extends MForNode {
    /**
     * Create a new MForInLoop
     * @param expression Expression that is or evaluates to an object
     * @param varName Name of variable to store the current value
     * @param indexName Name of variable to store the current index
     * @param attributes Optional attributes
     */
    constructor(expression: unknown, varName: string, indexName: string | undefined, attributes?: Map<string, unknown>) {
        super('in', expression, varName, indexName, attributes);
    }

    clone(deep = true, callback?: (oldNode: Node, newNode: Node) => void): MForInNode {
        return NodeLogic.cloneMForInNode(this, deep, callback);
    }

    /**
     * Returns true if a node is an MForNode using a for...in expression
     * @param node Node to check
     */
    static isMForInNode(node: Node): node is MForInNode {
        return MForNode.isMForNode(node) && node.expressionAttrName === 'in';
    }
}

/**
 * Supported MIME types of data contents
 */
export type MDataNodeType = MimeType.JSON | MimeType.TEXT

/**
 * A data reference defined in an <m-data> node
 */
export interface MDataNodeRef {
    /**
     * Path to the data file
     */
    resPath: string,

    /**
     * Name of the scope variable to bind to
     */
    varName: string
}

/**
 * <m-data> node.
 * Loads data files into the containing scope.
 * Once loaded, content is standard mutable scope data.
 * Multiple data files can be defined on the same tag.
 */
export class MDataNode extends TagNode {
    constructor(type: MDataNodeType, attributes?: Map<string, unknown>) {
        super('m-data', attributes);

        this.type = type;
    }

    /**
     * MIME type of data loaded by this MDataNode
     */
    get type(): MDataNodeType {
        return this.getRequiredValueAttribute('type') as MDataNodeType;
    }
    set type(newType: MDataNodeType) {
        this.setRequiredValueAttribute('type', newType);
    }
    
    /**
     * Data references defined by this MDataNode.
     * This is recomputed at each access, so cache into a local var if repeated access is needed.
     */
    get references(): MDataNodeRef[] {
        return Array.from(this.attributes.entries())
            // skip the "type" attribute as it is reserved
            .filter(entry => entry[0] != 'type')
            
            // convert remaining attributes into MDataNodeRef objects
            .map(entry => {
                return {
                    resPath: String(entry[1]),
                    varName: entry[0]
                } as MDataNodeRef;
            });
    }

    clone(deep = true, callback?: (oldNode: Node, newNode: Node) => void): MDataNode {
        return NodeLogic.cloneMDataNode(this, deep, callback);
    }

    /**
     * Returns true if a node is an MDataNode
     * @param node Node to check
     */
    static isMDataNode(node: Node): node is MDataNode {
        return TagNode.isTagNode(node) && node.tagName === 'm-data';
    }
}

/**
 * <style> node.
 * May be compiled (processed by mooltipage) or not (ignored by mooltipage)
 */
export class StyleNode extends TagNode {
    /**
     * If this StyleNode is being processed by Mooltipage
     */
    readonly compiled: boolean;

    constructor(compiled?: boolean, attributes?: Map<string, unknown>) {
        super('style', attributes);

        this.compiled = compiled ?? false;
        this.setBooleanAttribute('compiled', this.compiled);
    }

    clone(deep = true, callback?: (oldNode: Node, newNode: Node) => void): StyleNode {
        return NodeLogic.cloneStyleNode(this, deep, callback);
    }

    /**
     * Returns true if a node is a StyleNode
     * @param node Node to check
     */
    static isStyleNode(node: Node): node is StyleNode {
        return TagNode.isTagNode(node) && node.tagName === 'style';
    }
}

/**
 * Recognized binding mode for compiled <style> nodes.
 * Controls how the stylesheet will be linked to the page 
 */
export enum StyleNodeBind {
    /**
     * Stylesheet will be placed in an inline <style> block in the page <head> section.
     */
    HEAD = 'head',

    /**
     * Stylesheet will be placed in an external CSS file and referenced via a <link> tag.
     */
    LINK = 'link'
}

/**
 * Parent class for specialized types of compiled <style> nodes
 */
export abstract class CompiledStyleNode extends StyleNode {
    /**
     * If this style node points to an external stylesheet.
     */
    readonly isExternal: boolean;

    protected constructor(isExternal: boolean, bindType?: StyleNodeBind, attributes?: Map<string, unknown>) {
        super(true, attributes);

        this.isExternal = isExternal;
        this.bind = bindType ?? StyleNodeBind.HEAD;
    }

    /**
     * The bind type of this <style> node
     */
    get bind(): StyleNodeBind {
        return this.getAttribute('bind') as StyleNodeBind;
    }
    set bind(newBindType: StyleNodeBind) {
        this.setAttribute('bind', newBindType);
    }

    /**
     * Returns true if a node is a CompiledStyleNode
     * @param node Node to check
     */
    static isCompiledStyleNode(node: Node): node is CompiledStyleNode {
        return StyleNode.isStyleNode(node) && node.compiled;
    }
}

/**
 * <style> node that is compiled and contains an inline stylesheet
 */
export class InternalStyleNode extends CompiledStyleNode {
    constructor(bindType?: StyleNodeBind, attributes?: Map<string, unknown>) {
        super(false, bindType, attributes);
    }

    /**
     * Text content of the stylesheet.
     * Will never be null or undefined.
     * If no stylesheet is present, then an empty string is returned.
     */
    get styleContent(): string {
        const styleTextNode = this.firstChild;
        if (styleTextNode != null && TextNode.isTextNode(styleTextNode)) {
            return styleTextNode.text;
        } else {
            return '';
        }
    }

    clone(deep = true, callback?: (oldNode: Node, newNode: Node) => void): InternalStyleNode {
        return NodeLogic.cloneInternalStyleNode(this, deep, callback);
    }

    /**
     * Returns true if a node is an InternalStyleNode
     * @param node Node to check
     */
    static isInternalStyleNode(node: Node): node is InternalStyleNode {
        return CompiledStyleNode.isCompiledStyleNode(node) && !node.isExternal;
    }
}

/**
 * <style> node that is compiled and points to an external stylesheet
 */
export class ExternalStyleNode extends CompiledStyleNode {
    constructor(src: string, bindType?: StyleNodeBind, attributes?: Map<string, unknown>) {
        super(true, bindType, attributes);

        this.src = src;
    }

    /**
     * Path to the stylesheet
     */
    get src(): string {
        return this.getRequiredValueAttribute('src');
    }
    set src(newSrc: string) {
        this.setRequiredValueAttribute('src', newSrc);
    }

    clone(deep = true, callback?: (oldNode: Node, newNode: Node) => void): ExternalStyleNode {
        return NodeLogic.cloneExternalStyleNode(this, deep, callback);
    }

    /**
     * Returns true if a node is an ExternalStyleNode
     * @param node Node to check
     */
    static isExternalStyleNode(node: Node): node is ExternalStyleNode {
        return CompiledStyleNode.isCompiledStyleNode(node) && node.isExternal;
    }
}

/**
 * <script> tag.
 * Can be compiled (processed by Mooltipage) or not (ignored by mooltipage)
 */
export class ScriptNode extends TagNode {
    /**
     * If this <script> is compiled by mooltipage or ignored
     */
    readonly compiled: boolean;
    
    constructor(compiled?: boolean, attributes?: Map<string, unknown>) {
        super('script', attributes);

        this.compiled = compiled ?? false;
        this.setBooleanAttribute('compiled', this.compiled);
    }

    clone(deep = true, callback?: (oldNode: Node, newNode: Node) => void): ScriptNode {
        return NodeLogic.cloneScriptNode(this, deep, callback);
    }

    /**
     * Returns true if a node is a ScriptNode
     * @param node Node to check
     */
    static isScriptNode(node: Node): node is ScriptNode {
        return TagNode.isTagNode(node) && node.tagName === 'script';
    }
}

/**
 * Parent class for any specialize <script> nodes
 */
export abstract class CompiledScriptNode extends ScriptNode {
    /**
     * If this script is loaded from an external file or inline code
     */
    readonly isExternal: boolean;

    protected constructor(isExternal: boolean, attributes?: Map<string, unknown>) {
        super(true, attributes);

        this.isExternal = isExternal;
    }

    /**
     * Returns true if a node is a CompiledScriptNode
     * @param node Node to check
     */
    static isCompiledScriptNode(node: Node): node is CompiledScriptNode {
        return ScriptNode.isScriptNode(node) && node.compiled;
    }
}

/**
 * <script> node that is compiled from an inline script
 */
export class InternalScriptNode extends CompiledScriptNode {
    constructor(attributes?: Map<string, unknown>) {
        super(false, attributes);
    }

    /**
     * Contents of the script.
     * Will never be null or undefined.
     * If no script is included, then an empty string is returned
     */
    get scriptContent(): string {
        const scriptText = this.firstChild;
        if (scriptText != null && TextNode.isTextNode(scriptText)) {
            return scriptText.text;
        } else {
            return '';
        }
    }

    clone(deep = true, callback?: (oldNode: Node, newNode: Node) => void): InternalScriptNode {
        return NodeLogic.cloneInternalScriptNode(this, deep, callback);
    }

    /**
     * Returns true if a node is a InternalScriptNode
     * @param node Node to check
     */
    static isInternalScriptNode(node: Node): node is InternalScriptNode {
        return CompiledScriptNode.isCompiledScriptNode(node) && !node.isExternal;
    }
}

/**
 * <script> node that is compiled from an external file
 */
export class ExternalScriptNode extends CompiledScriptNode {
    constructor(src: string, attributes?: Map<string, unknown>) {
        super(true, attributes);

        this.src = src;
    }

    /**
     * Path to source file
     */
    get src(): string {
        return this.getRequiredValueAttribute('src');
    }
    set src(newSrc: string) {
        this.setRequiredValueAttribute('src', newSrc);
    }

    clone(deep = true, callback?: (oldNode: Node, newNode: Node) => void): ExternalScriptNode {
        return NodeLogic.cloneExternalScriptNode(this, deep, callback);
    }

    /**
     * Returns true if a node is an ExternalScriptNode
     * @param node Node to check
     */
    static isExternalScriptNode(node: Node): node is ExternalScriptNode {
        return CompiledScriptNode.isCompiledScriptNode(node) && node.isExternal;
    }
}
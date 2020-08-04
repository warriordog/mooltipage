import { Node, NodeWithChildren, DocumentNode, TagNode, TextNode, CommentNode, CDATANode, ProcessingInstructionNode, MFragmentNode, MSlotNode, MContentNode, MVarNode, MScopeNode, MIfNode, MForOfNode, MForInNode, MElseNode, MElseIfNode, MDataNode, InternalStyleNode, ExternalStyleNode, StyleNode, ScriptNode, InternalScriptNode, ExternalScriptNode, MImportNode } from './node';

/**
 * Detatch a node and its children from the DOM.
 * @param node Node to detatch
 */
export function detatchNode(node: Node): void {
    if (node.parentNode != null) {
        node.parentNode.childNodes = node.parentNode.childNodes.filter((childNode: Node) => childNode !== node);
    }

    if (node.prevSibling != null) {
        node.prevSibling.nextSibling = node.nextSibling;
    }

    if (node.nextSibling != null) {
        node.nextSibling.prevSibling = node.prevSibling;
    }

    node.prevSibling = null;
    node.nextSibling = null;
    node.parentNode = null;
    Object.setPrototypeOf(node.nodeData, null);
}

/**
 * Check if one node is the child of another
 * @param parent Parent node
 * @param child Possible child node
 */
export function hasChild(parent: NodeWithChildren, child: Node): boolean {
    return parent.childNodes.includes(child);
}

/**
 * Appends one node to another as a child.
 * Node will be inserted at the end of the parent's child nodes list.
 * 
 * @param parent Parent node
 * @param child New child node
 */
export function appendChild(parent: NodeWithChildren, child: Node): void {
    if (DocumentNode.isDocumentNode(child)) {
        throw new Error(`Cannot insert a DocumentNode as child`);
    }

    detatchNode(child);

    if (parent.lastChild) {
        parent.lastChild.nextSibling = child;
        child.prevSibling = parent.lastChild;
    }

    parent.childNodes.push(child);
    child.parentNode = parent;
    Object.setPrototypeOf(child.nodeData, parent.nodeData);
}

/**
 * Appends one node to another as a child.
 * Node will be inserted at the start of the parent's child nodes list.
 * 
 * @param parent Parent node
 * @param child New child node
 */
export function prependChild(parent: NodeWithChildren, child: Node): void {
    if (DocumentNode.isDocumentNode(child)) {
        throw new Error(`Cannot insert a DocumentNode as child`);
    }

    detatchNode(child);

    if (parent.firstChild) {
        parent.firstChild.prevSibling = child;
        child.nextSibling = parent.firstChild;
    }

    parent.childNodes.splice(0, 0, child);
    child.parentNode = parent;
    Object.setPrototypeOf(child.nodeData, parent.nodeData);
}

/**
 * Removes all children from a node
 * @param parent Parent to remove nodes from
 */
export function clear(parent: NodeWithChildren): void {
    for (const child of Array.from(parent.childNodes)) {
        detatchNode(child);
    }
}

/**
 * Appends a list of nodes to a parent
 * @param parent Parent node
 * @param childNodes New child nodes
 */
export function appendChildNodes(parent: NodeWithChildren, childNodes: Node[]): void {
    for (const childNode of childNodes) {
        appendChild(parent, childNode);
    }
}

/**
 * Prepends a list of nodes to a parent
 * @param parent Parent node
 * @param childNodes New child nodes
 */
export function prependChildNodes(parent: NodeWithChildren, childNodes: Node[]): void {
    // iterate in reverse to preserve order
    for (let i = childNodes.length - 1; i >= 0; i--) {
        prependChild(parent, childNodes[i]);
    }
}

/**
 * Places a node immediately after another as a sibling.
 * @param node Node to insert
 * @param after Existing node
 * @throws Throws if after is a DocumentNode
 */
export function appendSibling(node: Node, after: Node): void {
    if (DocumentNode.isDocumentNode(after)) {
        throw new Error(`Attempting to append ${ node.nodeType } after DocumentNode`);
    }
    if (DocumentNode.isDocumentNode(node)) {
        throw new Error(`Cannot insert a DocumentNode as child`);
    }

    detatchNode(node);

    const parent = after.parentNode;

    if (parent != null) {
        node.parentNode = parent;
        Object.setPrototypeOf(node.nodeData, parent.nodeData);

        const afterIndex = parent.childNodes.indexOf(after);
        parent.childNodes.splice(afterIndex + 1, 0, node);
    }

    if (after.nextSibling != null) {
        node.nextSibling = after.nextSibling;
        after.nextSibling.prevSibling = node;
    }

    after.nextSibling = node;
    node.prevSibling = after;
}

/**
 * Places a node immediately before another as a sibling.
 * @param node Node to insert
 * @param after Existing node
 * @throws Throws if after is a DocumentNode
 */
export function prependSibling(node: Node, before: Node): void {
    if (DocumentNode.isDocumentNode(before)) {
        throw new Error(`Attempting to prepend ${ node.nodeType } before DocumentNode`);
    }
    if (DocumentNode.isDocumentNode(node)) {
        throw new Error(`Cannot insert a DocumentNode as child`);
    }

    detatchNode(node);
    
    const parent = before.parentNode;

    if (parent != null) {
        node.parentNode = parent;
        Object.setPrototypeOf(node.nodeData, parent.nodeData);

        const beforeIndex = parent.childNodes.indexOf(before);
        parent.childNodes.splice(beforeIndex, 0, node);
    }

    if (before.prevSibling != null) {
        node.prevSibling = before.prevSibling;
        before.prevSibling.nextSibling = node;
    }

    before.prevSibling = node;
    node.nextSibling = before;
}

/**
 * Gets the first child from a list of nodes
 * @param nodes Return the first node from a list, or null if the list is empty
 */
export function getFirstNode(nodes: Node[]): Node | null {
    if (nodes.length > 0) {
        return nodes[0];
    } else {
        return null;
    }
}

/**
 * Gets the last child from a list of nodes
 * @param nodes Return the last node from a list, or null if the list is empty
 */
export function getLastNode(nodes: Node[]): Node | null {
    if (nodes.length > 0) {
        return nodes[nodes.length - 1];
    } else {
        return null;
    }
}

// not exported
function processClonedNode<T extends Node>(oldNode: T, newNode: T, callback?: (oldNode: Node, newNode: Node) => void): void {
    if (callback != undefined) {
        callback(oldNode, newNode);
    }
}

// not exported
function processClonedParentNode<T extends NodeWithChildren>(oldNode: T, newNode: T, deep: boolean, callback?: (oldNode: Node, newNode: Node) => void): void {
    processClonedNode(oldNode, newNode, callback);

    if (deep) {
        cloneChildNodes(newNode, oldNode.childNodes, callback);
    }
}

// not exported
function cloneAttributes(node: TagNode): Map<string, unknown> {
    const oldAttrs = node.getAttributes();

    const attrEntries = oldAttrs.entries();

    return new Map(attrEntries);
}

/**
 * Clones a tag node
 * @param node Node to clone
 * @param deep If true, children will be cloned
 * @param callback Optional callback after node is cloned
 */
export function cloneTagNode(node: TagNode, deep: boolean, callback?: (oldNode: Node, newNode: Node) => void): TagNode {
    const newAttrs = cloneAttributes(node);

    const newNode: TagNode = new TagNode(node.tagName, newAttrs);

    processClonedParentNode(node, newNode, deep, callback);

    return newNode;
}

/**
 * Clones a text node
 * @param node Node to clone
 * @param callback Optional callback after node is cloned
 */
export function cloneTextNode(node: TextNode, callback?: (oldNode: Node, newNode: Node) => void): TextNode {
    const newNode: TextNode = new TextNode(node.text);
    
    processClonedNode(node, newNode, callback);

    return newNode;
}

/**
 * Clones a comment node
 * @param node Node to clone
 * @param callback Optional callback after node is cloned
 */
export function cloneCommentNode(node: CommentNode, callback?: (oldNode: Node, newNode: Node) => void): CommentNode {
    const newNode: CommentNode = new CommentNode(node.text);
    
    processClonedNode(node, newNode, callback);

    return newNode;
}

/**
 * Clones a CDATA node
 * @param node Node to clone
 * @param deep If true, children will be cloned
 * @param callback Optional callback after node is cloned
 */
export function cloneCDATANode(node: CDATANode, deep: boolean, callback?: (oldNode: Node, newNode: Node) => void): CDATANode {
    const newNode: CDATANode = new CDATANode();

    processClonedParentNode(node, newNode, deep, callback);

    return newNode;
}

/**
 * Clones a processing instruction node
 * @param node Node to clone
 * @param callback Optional callback after node is cloned
 */
export function cloneProcessingInstructionNode(node: ProcessingInstructionNode, callback?: (oldNode: Node, newNode: Node) => void): ProcessingInstructionNode {
    const newNode: ProcessingInstructionNode = new ProcessingInstructionNode(node.name, node.data);
    
    processClonedNode(node, newNode, callback);

    return newNode;
}

/**
 * Clones a document node
 * @param node Node to clone
 * @param deep If true, children will be cloned
 * @param callback Optional callback after node is cloned
 */
export function cloneDocumentNode(node: DocumentNode, deep: boolean, callback?: (oldNode: Node, newNode: Node) => void): DocumentNode {
    const newNode: DocumentNode = new DocumentNode();

    processClonedParentNode(node, newNode, deep, callback);

    return newNode;
}

/**
 * Clones an m-fragment node
 * @param node Node to clone
 * @param deep If true, children will be cloned
 * @param callback Optional callback after node is cloned
 */
export function cloneMFragmentNode(node: MFragmentNode, deep: boolean, callback?: (oldNode: Node, newNode: Node) => void): MFragmentNode {
    const newAttrs = cloneAttributes(node);

    const newNode: MFragmentNode = new MFragmentNode(node.src, newAttrs);

    processClonedParentNode(node, newNode, deep, callback);

    return newNode;
}

/**
 * Clones an m-slot node
 * @param node Node to clone
 * @param deep If true, children will be cloned
 * @param callback Optional callback after node is cloned
 */
export function cloneMSlotNode(node: MSlotNode, deep: boolean, callback?: (oldNode: Node, newNode: Node) => void): MSlotNode {
    const newAttrs = cloneAttributes(node);

    const newNode: MSlotNode = new MSlotNode(node.slot, newAttrs);

    processClonedParentNode(node, newNode, deep, callback);

    return newNode;
}

/**
 * Clones an m-content node
 * @param node Node to clone
 * @param deep If true, children will be cloned
 * @param callback Optional callback after node is cloned
 */
export function cloneMContentNode(node: MContentNode, deep: boolean, callback?: (oldNode: Node, newNode: Node) => void): MContentNode {
    const newAttrs = cloneAttributes(node);

    const newNode: MContentNode = new MContentNode(node.slot, newAttrs);

    processClonedParentNode(node, newNode, deep, callback);

    return newNode;
}

/**
 * Clones an m-var node
 * @param node Node to clone
 * @param deep If true, children will be cloned
 * @param callback Optional callback after node is cloned
 */
export function cloneMVarNode(node: MVarNode, deep: boolean, callback?: (oldNode: Node, newNode: Node) => void): MVarNode {
    const newAttrs = cloneAttributes(node);

    const newNode: MVarNode = new MVarNode(newAttrs);

    processClonedParentNode(node, newNode, deep, callback);

    return newNode;
}

/**
 * Clones an m-scope node
 * @param node Node to clone
 * @param deep If true, children will be cloned
 * @param callback Optional callback after node is cloned
 */
export function cloneMScopeNode(node: MScopeNode, deep: boolean, callback?: (oldNode: Node, newNode: Node) => void): MScopeNode {
    const newAttrs = cloneAttributes(node);

    const newNode = new MScopeNode(newAttrs);

    processClonedParentNode(node, newNode, deep, callback);

    return newNode;
}

/**
 * Clones an m-import node
 * @param node Node to clone
 * @param deep If true, children will be cloned
 * @param callback Optional callback after node is cloned
 */
export function cloneMImportNode(node: MImportNode, deep: boolean, callback?: (oldNode: Node, newNode: Node) => void): MImportNode {
    const newAttrs = cloneAttributes(node);

    const newNode = new MImportNode(node.src, node.as, newAttrs);

    processClonedParentNode(node, newNode, deep, callback);

    return newNode;
}

/**
 * Clones an m-if node
 * @param node Node to clone
 * @param deep If true, children will be cloned
 * @param callback Optional callback after node is cloned
 */
export function cloneMIfNode(node: MIfNode, deep: boolean, callback?: (oldNode: Node, newNode: Node) => void): MIfNode {
    const newAttrs = cloneAttributes(node);

    const newNode = new MIfNode(node.condition, newAttrs);

    processClonedParentNode(node, newNode, deep, callback);

    return newNode;
}

/**
 * Clones an m-else-if node
 * @param node Node to clone
 * @param deep If true, children will be cloned
 * @param callback Optional callback after node is cloned
 */
export function cloneMElseIfNode(node: MElseIfNode, deep: boolean, callback?: (oldNode: Node, newNode: Node) => void): MElseIfNode {
    const newAttrs = cloneAttributes(node);

    const newNode = new MElseIfNode(node.condition, newAttrs);

    processClonedParentNode(node, newNode, deep, callback);

    return newNode;
}

/**
 * Clones an m-else node
 * @param node Node to clone
 * @param deep If true, children will be cloned
 * @param callback Optional callback after node is cloned
 */
export function cloneMElseNode(node: MElseNode, deep: boolean, callback?: (oldNode: Node, newNode: Node) => void): MElseNode {
    const newAttrs = cloneAttributes(node);

    const newNode = new MElseNode(newAttrs);

    processClonedParentNode(node, newNode, deep, callback);

    return newNode;
}
/**
 * Clones an MForOf node
 * @param node Node to clone
 * @param deep If true, children will be cloned
 * @param callback Optional callback after node is cloned
 */
export function cloneMForOfNode(node: MForOfNode, deep: boolean, callback?: (oldNode: Node, newNode: Node) => void): MForOfNode {
    const newAttrs = cloneAttributes(node);

    const newNode = new MForOfNode(node.expression, node.varName, node.indexName, newAttrs);

    processClonedParentNode(node, newNode, deep, callback);

    return newNode;
}

/**
 * Clones an MForIn node
 * @param node Node to clone
 * @param deep If true, children will be cloned
 * @param callback Optional callback after node is cloned
 */
export function cloneMForInNode(node: MForInNode, deep: boolean, callback?: (oldNode: Node, newNode: Node) => void): MForInNode {
    const newAttrs = cloneAttributes(node);

    const newNode = new MForInNode(node.expression, node.varName, node.indexName, newAttrs);

    processClonedParentNode(node, newNode, deep, callback);

    return newNode;
}

/**
 * Clones an MDataNode
 * @param node Node to clone
 * @param deep If true, children will be cloned
 * @param callback Optional callback after node is cloned
 */
export function cloneMDataNode(node: MDataNode, deep: boolean, callback?: (oldNode: Node, newNode: Node) => void): MDataNode {
    const newAttrs = cloneAttributes(node);

    const newNode = new MDataNode(node.type, newAttrs);

    processClonedParentNode(node, newNode, deep, callback);

    return newNode;
}

/**
 * Clones a StyleNode
 * @param node Node to clone
 * @param deep If true, children will be cloned
 * @param callback Optional callback after node is cloned
 */
export function cloneStyleNode(node: StyleNode, deep: boolean, callback?: (oldNode: Node, newNode: Node) => void): StyleNode {
    const newAttrs = cloneAttributes(node);

    const newNode = new StyleNode(node.compiled, newAttrs);

    processClonedParentNode(node, newNode, deep, callback);

    return newNode;
}

/**
 * Clones an InternalStyleNode
 * @param node Node to clone
 * @param deep If true, children will be cloned
 * @param callback Optional callback after node is cloned
 */
export function cloneInternalStyleNode(node: InternalStyleNode, deep: boolean, callback?: (oldNode: Node, newNode: Node) => void): InternalStyleNode {
    const newAttrs = cloneAttributes(node);

    const newNode = new InternalStyleNode(node.bind, newAttrs);

    processClonedParentNode(node, newNode, deep, callback);

    return newNode;
}

/**
 * Clones an ExternalStyleNode
 * @param node Node to clone
 * @param deep If true, children will be cloned
 * @param callback Optional callback after node is cloned
 */
export function cloneExternalStyleNode(node: ExternalStyleNode, deep: boolean, callback?: (oldNode: Node, newNode: Node) => void): ExternalStyleNode {
    const newAttrs = cloneAttributes(node);

    const newNode = new ExternalStyleNode(node.src, node.bind, newAttrs);

    processClonedParentNode(node, newNode, deep, callback);

    return newNode;
}

/**
 * Clones a ScriptNode
 * @param node Node to clone
 * @param deep If true, children will be cloned
 * @param callback Optional callback after node is cloned
 */
export function cloneScriptNode(node: ScriptNode, deep: boolean, callback?: (oldNode: Node, newNode: Node) => void): ScriptNode {
    const newAttrs = cloneAttributes(node);

    const newNode = new ScriptNode(node.compiled, newAttrs);

    processClonedParentNode(node, newNode, deep, callback);

    return newNode;
}

/**
 * Clones an InternalScriptNode
 * @param node Node to clone
 * @param deep If true, children will be cloned
 * @param callback Optional callback after node is cloned
 */
export function cloneInternalScriptNode(node: InternalScriptNode, deep: boolean, callback?: (oldNode: Node, newNode: Node) => void): InternalScriptNode {
    const newAttrs = cloneAttributes(node);

    const newNode = new InternalScriptNode(newAttrs);

    processClonedParentNode(node, newNode, deep, callback);

    return newNode;
}

/**
 * Clones an ExternalScriptNode
 * @param node Node to clone
 * @param deep If true, children will be cloned
 * @param callback Optional callback after node is cloned
 */
export function cloneExternalScriptNode(node: ExternalScriptNode, deep: boolean, callback?: (oldNode: Node, newNode: Node) => void): ExternalScriptNode {
    const newAttrs = cloneAttributes(node);

    const newNode = new ExternalScriptNode(node.src, newAttrs);

    processClonedParentNode(node, newNode, deep, callback);

    return newNode;
}

/**
 * Finds the first child node that matches a matcher
 * @param parent Parent node
 * @param matcher Matcher to check nodes
 * @param deep If true, child nodes will be recursively searched
 */
export function findChildNode(parent: NodeWithChildren, matcher: (node: Node) => boolean, deep: boolean): Node | null {
    for (const childNode of parent.childNodes) {
        if (matcher(childNode)) {
            return childNode;
        }

        if (deep && NodeWithChildren.isNodeWithChildren(childNode)) {
            const childMatch = findChildNode(childNode, matcher, true);
            if (childMatch != null) {
                return childMatch;
            }
        }
    }

    return null;
}

/**
 * Finds all child nodes that match a matcher
 * @param parent Parent node
 * @param matcher Matcher to check nodes
 * @param deep If true, child nodes will be recursively searched
 * @param matches Existing list of nodes to append to, if desired
 */
export function findChildNodes(parent: NodeWithChildren, matcher: (node: Node) => boolean, deep: boolean, matches: Node[] = []): Node[] {
    for (const childNode of parent.childNodes) {
        if (matcher(childNode)) {
            matches.push(childNode);
        }

        if (deep && NodeWithChildren.isNodeWithChildren(childNode)) {
            findChildNodes(childNode, matcher, true, matches);
        }
    }

    return matches;
}

/**
 * Finds the first child tag that matches a matcher
 * @param parent Parent node
 * @param matcher Matcher to check tags
 * @param deep If true, child tags will be recursively searched
 */
export function findChildTag(parent: NodeWithChildren, matcher: (tag: TagNode) => boolean, deep: boolean): TagNode | null {
    const newMatcher = (node: Node) => TagNode.isTagNode(node) && matcher(node);
    return findChildNode(parent, newMatcher, deep) as TagNode;
}

/**
 * Finds all child tags that match a matcher
 * @param parent Parent node
 * @param matcher Matcher to check tags
 * @param deep If true, child tags will be recursively searched
 * @param matches Existing list of tags to append to, if desired
 */
export function findChildTags(parent: NodeWithChildren, matcher: (tag: TagNode) => boolean, deep: boolean): TagNode[] {
    const newMatcher = (node: Node) => TagNode.isTagNode(node) && matcher(node);
    return findChildNodes(parent, newMatcher, deep) as TagNode[];
}

/**
 * Replace a node in the DOM with one or more replacements.
 * Child nodes will be deleted.
 * 
 * @param remove Node to remove
 * @param replacements Replacement nodes
 */
export function replaceNode(remove: Node, replacements: Node[]): void {
    let prevNode: Node = remove;

    for (const newNode of replacements) {
        prevNode.appendSibling(newNode);
        prevNode = newNode;
    }

    detatchNode(remove);
}

/**
 * Gets all child tags from a parent node
 * @param parent Parent node
 */
export function getChildTags(parent: NodeWithChildren): TagNode[] {
    return parent.childNodes.filter((node: Node) => TagNode.isTagNode(node)) as TagNode[];
}

/**
 * Removes all children from a parent node and creates a DocumentNode containing them
 * 
 * @param parent Parent node
 */
export function createDomFromChildren(parent: NodeWithChildren): DocumentNode {
    // create dom
    const dom: DocumentNode = new DocumentNode();

    // transfer children
    dom.appendChildren(parent.childNodes);

    return dom;
}

// not exported
function cloneChildNodes(parent: NodeWithChildren, childNodes: Node[], callback?: (oldNode: Node, newNode: Node) => void): void {
    if (childNodes.length > 0) {
        const newChildren = childNodes.map(node => node.clone(true, callback));
        appendChildNodes(parent, newChildren);
    }
}

/**
 * Gets the closest previous sibling that is a TagNode
 * @param node Node to search from
 */
export function getPreviousTag(node: Node): TagNode | null {
    let currentNode: Node | null = node.prevSibling;
    while (currentNode != null) {
        if (TagNode.isTagNode(currentNode)) {
            return currentNode;
        }

        currentNode = currentNode.prevSibling;
    }

    return null;
}

/**
 * Gets the closest following sibling that is a TagNode
 * @param node Node to search from
 */
export function getNextTag(node: Node): TagNode | null {
    let currentNode: Node | null = node.nextSibling;
    while (currentNode != null) {
        if (TagNode.isTagNode(currentNode)) {
            return currentNode;
        }

        currentNode = currentNode.nextSibling;
    }

    return null;
}

/**
 * Serialize a DOM tree into HTML text.
 * Does not apply any formatting or transformations.
 * 
 * @param node Root node
 * @returns a string containing serialized HTML.
 */
export function serializeNode(node: Node): string {
    const html: string[] = [];

    serializeNodeAt(node, html);

    return html.join('');
}

function serializeNodeAt(node: Node, html: string[]): void {
    if (TagNode.isTagNode(node)) {
        serializeTag(node, html);
    } else if (TextNode.isTextNode(node)) {
        serializeText(node, html);
    } else if (CommentNode.isCommentNode(node)) {
        serializeComment(node, html);
    } else if (DocumentNode.isDocumentNode(node)) {
        serializeDocument(node, html);
    } else if (CDATANode.isCDATANode(node)) {
        serializeCDATA(node, html);
    } else if (ProcessingInstructionNode.isProcessingInstructionNode(node)) {
        serializeProcessingInstruction(node, html);
    } else {
        throw new Error(`Unknown nodeType: ${ node.nodeType }`);
    }
}

function serializeDocument(dom: DocumentNode, html: string[]): void {
    serializeChildNodes(dom, html);
}

function serializeTag(tag: TagNode, html: string[]): void {
    const tagName = tag.tagName.toLowerCase();
    validateTagText(tagName);

    html.push('<');
    html.push(tagName);
    
    if (tag.getAttributes().size > 0) {
        appendAttributeList(tag.getAttributes(), html);
    }

    if (isSelfClosingTag(tagName)) {
        html.push(' />');
    } else {
        html.push('>');

        serializeChildNodes(tag, html);

        html.push('</');
        html.push(tagName);
        html.push('>');
    }
}

function serializeText(text: TextNode, html: string[]): void {
    const textContent: string = escapeTextContent(text.text);

    if (textContent.length > 0) {
        html.push(textContent);
    }
}

function serializeComment(comment: CommentNode, html: string[]): void {
    html.push('<!--');
    const textContent: string = escapeTextContent(comment.text);

    if (textContent.length > 0) {
        html.push(textContent);
    }
    html.push('-->');
}

function serializeCDATA(cdata: CDATANode, html: string[]): void {
    html.push('<![CDATA[');

    serializeChildNodes(cdata, html);

    html.push(']]>');
}

// this implementation is probably not accurate, but its good enough for <!DOCTYPE html>
function serializeProcessingInstruction(pi: ProcessingInstructionNode, html: string[]): void {
    if (pi.name === '!doctype') {
        serializeDoctypePI(pi, html);
    } else {
        throw new Error(`Unimplemented processing instruction: ${ pi.name }`);
    }
}

function serializeDoctypePI(pi: ProcessingInstructionNode, html: string[]): void {
    validateTagText(pi.data);

    html.push('<');
    html.push(pi.data);
    html.push('>');
}

function serializeChildNodes(parent: NodeWithChildren, html: string[]): void {
    for (const childNode of parent.childNodes) {
        serializeNodeAt(childNode, html);
    }
}

function validateTagText(tagName: string): void {
    if (/[<>"&]+/.test(tagName)) {
        throw new Error(`Invalid tag name: ${ tagName }`);
    }
}

function escapeTextContent(textContent: string): string {
    return textContent.replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;').replace('&', '&amp;');
}

function appendAttributeList(attributeMap: ReadonlyMap<string, unknown>, html: string[]): void {
    for (const entry of attributeMap.entries()) {
        const key = entry[0];
        const value = entry[1];

        html.push(' ');

        html.push(key);
        
        if (value != null) {
            // convert to string, since it could be any type
            const valueString = String(value);

            validateTagText(valueString);

            html.push('="');
            html.push(valueString);
            html.push('"');
        }
    }
}

function isSelfClosingTag(tagName: string): boolean {
    return selfClosingTags.includes(tagName);
}

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
import { Node, TagNode, TextNode, CommentNode, CDATANode, ProcessingInstructionNode, DocumentNode, NodeWithChildren, MFragmentNode, MComponentNode, MSlotNode, MContentNode, MVarNode, MImportNode } from './node';

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
}

export function hasChild(parent: NodeWithChildren, child: Node): boolean {
    return parent.childNodes.includes(child);
}

export function appendChild(parent: NodeWithChildren, child: Node): void {
    detatchNode(child);

    if (parent.lastChild) {
        parent.lastChild.nextSibling = child;
        child.prevSibling = parent.lastChild;
    }

    parent.childNodes.push(child);
    child.parentNode = parent;

    child.nextSibling = null;
}

export function prependChild(parent: NodeWithChildren, child: Node): void {
    detatchNode(child);

    if (parent.firstChild) {
        parent.firstChild.prevSibling = child;
        child.nextSibling = parent.firstChild;
    }

    parent.childNodes.splice(0, 0, child);
    child.parentNode = parent;

    child.nextSibling = null;
}

export function clear(parent: NodeWithChildren): void {
    for (const child of Array.from(parent.childNodes)) {
        detatchNode(child);
    }
}

export function appendChildNodes(parent: NodeWithChildren, childNodes: Node[]): void {
    for (const childNode of childNodes) {
        appendChild(parent, childNode);
    }
}

export function appendSibling(node: Node, after: Node): void {
    if (DocumentNode.isDocumentNode(after)) {
        throw new Error(`Attempting to append ${node.nodeType} after DocumentNode`);
    }

    detatchNode(node);

    const parent = after.parentNode;

    if (parent != null) {
        node.parentNode = parent;

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

export function prependSibling(node: Node, before: Node): void {
    if (DocumentNode.isDocumentNode(before)) {
        throw new Error(`Attempting to prepend ${node.nodeType} before DocumentNode`);
    }

    detatchNode(node);
    
    const parent = before.parentNode;

    if (parent != null) {
        node.parentNode = parent;

        const beforeIndex = parent.childNodes.indexOf(before);
        parent.childNodes.splice(beforeIndex, 0, node);
    }

    if (before.prevSibling != null) {
        node.prevSibling = before.prevSibling;
        before.prevSibling.nextSibling = node;
    }

    before.prevSibling = node;
    node.nextSibling = before.prevSibling;
}

export function getFirstChild(childNodes: Node[]): Node | null {
    if (childNodes.length > 0) {
        return childNodes[0];
    } else {
        return null;
    }
}

export function getLastChild(childNodes: Node[]): Node | null {
    if (childNodes.length > 0) {
        return childNodes[childNodes.length - 1];
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
function cloneAttributes(node: TagNode): Map<string, string | null> {
    const oldAttrs = node.getAttributes();

    const attrEntries = oldAttrs.entries();

    return new Map(attrEntries);
}

export function cloneTagNode(node: TagNode, deep: boolean, callback?: (oldNode: Node, newNode: Node) => void): TagNode {
    const newAttrs = cloneAttributes(node);

    const newNode: TagNode = new TagNode(node.tagName, newAttrs);

    processClonedParentNode(node, newNode, deep, callback);

    return newNode;
}

export function cloneTextNode(node: TextNode, callback?: (oldNode: Node, newNode: Node) => void): TextNode {
    const newNode: TextNode = new TextNode(node.text);
    
    processClonedNode(node, newNode, callback);

    return newNode;
}

export function cloneCommentNode(node: CommentNode, callback?: (oldNode: Node, newNode: Node) => void): CommentNode {
    const newNode: CommentNode = new CommentNode(node.text);
    
    processClonedNode(node, newNode, callback);

    return newNode;
}

export function cloneCDATANode(node: CDATANode, deep: boolean, callback?: (oldNode: Node, newNode: Node) => void): CDATANode {
    const newNode: CDATANode = new CDATANode();

    processClonedParentNode(node, newNode, deep, callback);

    return newNode;
}

export function cloneProcessingInstructionNode(node: ProcessingInstructionNode, callback?: (oldNode: Node, newNode: Node) => void): ProcessingInstructionNode {
    const newNode: ProcessingInstructionNode = new ProcessingInstructionNode(node.name, node.data);
    
    processClonedNode(node, newNode, callback);

    return newNode;
}

export function cloneDocumentNode(node: DocumentNode, deep: boolean, callback?: (oldNode: Node, newNode: Node) => void): DocumentNode {
    const newNode: DocumentNode = new DocumentNode();

    processClonedParentNode(node, newNode, deep, callback);

    return newNode;
}


export function cloneMFragmentNode(node: MFragmentNode, deep: boolean, callback?: (oldNode: Node, newNode: Node) => void): MFragmentNode {
    const newAttrs = cloneAttributes(node);

    const newNode: MFragmentNode = new MFragmentNode(node.src, newAttrs);

    processClonedParentNode(node, newNode, deep, callback);

    return newNode;
}

export function cloneMComponentNode(node: MComponentNode, deep: boolean, callback?: (oldNode: Node, newNode: Node) => void): MComponentNode {
    const newAttrs = cloneAttributes(node);

    const newNode: MComponentNode = new MComponentNode(node.src, newAttrs);

    processClonedParentNode(node, newNode, deep, callback);

    return newNode;
}

export function cloneMSlotNode(node: MSlotNode, deep: boolean, callback?: (oldNode: Node, newNode: Node) => void): MSlotNode {
    const newAttrs = cloneAttributes(node);

    const newNode: MSlotNode = new MSlotNode(node.slot, newAttrs);

    processClonedParentNode(node, newNode, deep, callback);

    return newNode;
}

export function cloneMContentNode(node: MContentNode, deep: boolean, callback?: (oldNode: Node, newNode: Node) => void): MContentNode {
    const newAttrs = cloneAttributes(node);

    const newNode: MContentNode = new MContentNode(node.slot, newAttrs);

    processClonedParentNode(node, newNode, deep, callback);

    return newNode;
}

export function cloneMVarNode(node: MVarNode, deep: boolean, callback?: (oldNode: Node, newNode: Node) => void): MVarNode {
    const newAttrs = cloneAttributes(node);

    const newNode: MVarNode = new MVarNode(newAttrs);

    processClonedParentNode(node, newNode, deep, callback);

    return newNode;
}

export function cloneMImportNode(node: MImportNode, deep: boolean, callback?: (oldNode: Node, newNode: Node) => void): MImportNode {
    const newAttrs = cloneAttributes(node);

    const newNode = new MImportNode(node.src, node.as, node.fragment, node.component, newAttrs);

    processClonedParentNode(node, newNode, deep, callback);

    return newNode;
}

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

export function findChildTag(parent: NodeWithChildren, matcher: (tag: TagNode) => boolean, deep: boolean): TagNode | null {
    const newMatcher = (node: Node) => TagNode.isTagNode(node) && matcher(node);
    return findChildNode(parent, newMatcher, deep) as TagNode;
}

export function findChildTags(parent: NodeWithChildren, matcher: (tag: TagNode) => boolean, deep: boolean): TagNode[] {
    const newMatcher = (node: Node) => TagNode.isTagNode(node) && matcher(node);
    return findChildNodes(parent, newMatcher, deep) as TagNode[];
}

export function replaceNode(remove: Node, replacements: Node[]): void {
    let prevNode: Node = remove;

    for (const newNode of replacements) {
        prevNode.appendSibling(newNode);
        prevNode = newNode;
    }

    detatchNode(remove);
}

export function swapNode(remove: NodeWithChildren, replacement: NodeWithChildren): void {
    replacement.appendChildren(remove.childNodes);

    remove.replaceSelf(replacement);
}

export function getChildTags(parent: NodeWithChildren): TagNode[] {
    return parent.childNodes.filter((node: Node) => TagNode.isTagNode(node)) as TagNode[];
}

export function walkDom(node: Node, callback: (node: Node) => void): void {
    callback(node);

    if (NodeWithChildren.isNodeWithChildren(node)) {
        for (const childNode of node.childNodes) {
            walkDom(childNode, callback);
        }
    }
}

export function findChildTagsByPath(root: NodeWithChildren, matchers: ((tag: TagNode) => boolean)[], offset = 0, matches: TagNode[] = []): TagNode[] {
    if (offset < matchers.length) {
        const matcher = matchers[offset];

        for (const childNode of root.childNodes) {
            // check if this node matches
            if (TagNode.isTagNode(childNode) && matcher(childNode)) {
                if (offset === matchers.length - 1) {
                    // if we are at the last matcher, then this is a result
                    matches.push(childNode);
                } else {
                    // if not at the last matcher, then recurse for child nodes
                    findChildTagsByPath(childNode, matchers, offset + 1, matches);
                }
            }
        }
    }

    return matches;
}

export function findTopLevelChildTags(parent: NodeWithChildren, matcher: (tag: TagNode) => boolean, matches: TagNode[] = []): TagNode[] {
    for (const childNode of parent.childNodes) {
        if (TagNode.isTagNode(childNode) && matcher(childNode)) {
            matches.push(childNode);
        } else if (NodeWithChildren.isNodeWithChildren(childNode)) {
            findTopLevelChildTags(childNode, matcher, matches);
        }
    }

    return matches;
}

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

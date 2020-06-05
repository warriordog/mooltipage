import { Node, TagNode, TextNode, CommentNode, CDATANode, ProcessingInstructionNode, DocumentNode, NodeWithChildren } from './node';

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

export function cloneTagNode(node: TagNode, deep: boolean, callback?: (oldNode: Node, newNode: Node) => void): TagNode {
    const newAttrs = new Map<string, string | null>();
    for (const entry of node.attributes.entries()) {
        newAttrs.set(entry[0], entry[1]);
    }

    const newNode: TagNode = new TagNode(node.tagName, newAttrs);

    if (callback != undefined) {
        callback(node, newNode);
    }

    if (deep) {
        cloneChildNodes(newNode, node.childNodes, callback);
    }

    return newNode;
}

export function cloneTextNode(node: TextNode, callback?: (oldNode: Node, newNode: Node) => void): TextNode {
    const newNode: TextNode = new TextNode(node.text);
    
    if (callback != undefined) {
        callback(node, newNode);
    }

    return newNode;
}

export function cloneCommentNode(node: CommentNode, callback?: (oldNode: Node, newNode: Node) => void): CommentNode {
    const newNode: CommentNode = new CommentNode(node.text);
    
    if (callback != undefined) {
        callback(node, newNode);
    }

    return newNode;
}

export function cloneCDATANode(node: CDATANode, deep: boolean, callback?: (oldNode: Node, newNode: Node) => void): CDATANode {
    const newNode: CDATANode = new CDATANode();

    if (callback != undefined) {
        callback(node, newNode);
    }

    if (deep) {
        cloneChildNodes(newNode, node.childNodes, callback);
    }

    return newNode;
}

export function cloneProcessingInstructionNode(node: ProcessingInstructionNode, callback?: (oldNode: Node, newNode: Node) => void): ProcessingInstructionNode {
    const newNode: ProcessingInstructionNode = new ProcessingInstructionNode(node.name, node.data);
    
    if (callback != undefined) {
        callback(node, newNode);
    }

    return newNode;
}

export function cloneDocumentNode(node: DocumentNode, deep: boolean, callback?: (oldNode: Node, newNode: Node) => void): DocumentNode {
    const newNode: DocumentNode = new DocumentNode();

    if (callback != undefined) {
        callback(node, newNode);
    }

    if (deep) {
        cloneChildNodes(newNode, node.childNodes, callback);
    }

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

export function findTopLevelChildNodes(parent: NodeWithChildren, matcher: (node: Node) => boolean, matches: Node[] = []): Node[] {
    for (const childNode of parent.childNodes) {
        if (matcher(childNode)) {
            matches.push(childNode);
        } else if (NodeWithChildren.isNodeWithChildren(childNode)) {
            findTopLevelChildNodes(childNode, matcher, matches);
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

export function findTopLevelChildTags(parent: NodeWithChildren, matcher: (tag: TagNode) => boolean): TagNode[] {
    const newMatcher = (node: Node) => TagNode.isTagNode(node) && matcher(node);
    return findTopLevelChildNodes(parent, newMatcher) as TagNode[];
}

export function replaceNode(remove: Node, replacements: Node[]): void {
    let prevNode: Node = remove;

    for (const replaceNode of replacements) {
        prevNode.appendSibling(replaceNode);
        prevNode = replaceNode;
    }

    detatchNode(remove);
}

export function getChildTags(node: NodeWithChildren): TagNode[] {
    return node.childNodes.filter((node: Node) => TagNode.isTagNode(node)) as TagNode[];
}

export function walkDom(node: Node, callback: (node: Node) => void): void {
    callback(node);

    if (NodeWithChildren.isNodeWithChildren(node)) {
        for (const childNode of node.childNodes) {
            walkDom(childNode, callback);
        }
    }
}

// not exported
function cloneChildNodes(parent: NodeWithChildren, childNodes: Node[], callback?: (oldNode: Node, newNode: Node) => void): void {
    if (childNodes.length > 0) {
        const newChildren = childNodes.map(node => node.clone(true, callback));
        appendChildNodes(parent, newChildren);
    }
}

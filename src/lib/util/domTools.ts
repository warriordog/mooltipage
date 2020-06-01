import * as DomUtils from 'domutils';
import { Node, Element, NodeWithChildren, DataNode } from 'domhandler';
import { ElementType } from "domelementtype";

export function replaceElementList(original: Node, replacements: Node[]): void {
    let previousNode: Node = original;

    for (const node of replacements) {
        DomUtils.append(previousNode, node);

        previousNode = node;
    }

    DomUtils.removeElement(original);
}

export function appendChildren(parent: NodeWithChildren, children: Node[]): void {
    for (const child of children) {
        appendChildNode(parent, child);
    }
}

// same as in DomUtils, but accepts NodeWithChildren instead of Element
export function appendChildNode(parent: NodeWithChildren, child: Node): void {
    child.parent = parent;
        
    if (parent.children.push(child) !== 1) {
        const sibling = parent.children[parent.children.length - 2];
        sibling.next = child;
        child.prev = sibling;
        child.next = null;
    }
}

export function emptyNode(parent: NodeWithChildren): void {
    parent.childNodes = [];
}

export function removeNodes(nodes: Node[]): void {
    for (const node of nodes) {
        DomUtils.removeElement(node);
    }
}

export function getAllTopLevelElements(roots: Node[], tagName: string): Element[] {
    const elementList: Element[] = [];

    for (const root of roots) {
        getTopLevelElements(root, tagName, elementList);
    }

    return elementList;
}

export function getTopLevelElements(node: Node, tagName: string, elementList: Element[]): Element[] {
    if (DomUtils.isTag(node)) {
        // check if child matches element
        if (node.tagName.toLowerCase() === tagName) {
            // Add the matching element, and do not process its children
            elementList.push(node);
        } else {
            // loop through each child of the root
            for (const childNode of node.childNodes) {
                // recursively process nodes that do not match
                getTopLevelElements(childNode, tagName, elementList);
            }
        }
    }

    return elementList;
}

export function cloneNodes(nodes: Node[], deep?: boolean): Node[] {
    return nodes.map((node: Node) => cloneNode(node, deep));
}

export function cloneNode(node: Node, deep?: boolean): Node {
    // clone node
    const clone = cloneSingleNode(node);

    // deep copy
    if (deep === true && DomUtils.hasChildren(node) && DomUtils.hasChildren(clone)) {
        // clone children
        const children = cloneNodes(node.childNodes, true);

        // attach to clone
        appendChildren(clone, children);
    }

    return clone;
}

// not exported
function cloneSingleNode(node: Node): Node {
    const nodeType: string = node.type;
    if (nodeType === ElementType.Tag) {
        const elem = node as Element;
        return new Element(elem.name, elem.attribs);
    } else if (nodeType === ElementType.Text) {
        const text = node as DataNode;
        return new DataNode(ElementType.Text, text.data);
    } else if (nodeType === ElementType.Comment) {
        const comment = node as DataNode;
        return new DataNode(ElementType.Comment, comment.data);
    } else if (nodeType === ElementType.Script) {
        const script = node as Element;
        return new Element(ElementType.Script, script.attribs);
    } else if (nodeType === ElementType.Style) {
        const style = node as Element;
        return new Element(ElementType.Style, style.attribs);
    } else if (nodeType === ElementType.CDATA) {
        const cdata = node as Element;
        return new Element(ElementType.Style, cdata.attribs);
    } else if (nodeType === ElementType.Directive) {
        const directive = node as DataNode;
        return new DataNode(ElementType.Directive, directive.data);
    } else {
        throw new Error(`Unknown node type: ${nodeType}`);
    }
}

export function getChildText(node: Node | null): string | null {
    if (node == null) {
        return null;
    }
    
    if (DomUtils.isText(node)) {
        return node.data;
    }
    
    if (DomUtils.hasChildren(node)) {
        const firstChild = node.firstChild;
        if (firstChild != null && DomUtils.isText(firstChild)) {
            return firstChild.data;
        } else {
            return null;
        }
    } else {
        return null;
    }
}

export function getChildElements(node: NodeWithChildren | null) : Node[] | null {
    if (node == null) {
        return null;
    }

    return node.childNodes.filter((node: Node) => node.type === ElementType.Tag);
}
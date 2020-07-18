import { DocumentNode, TagNode, NodeWithChildren } from "../..";

/**
 * A compiled or compiling page
 */
export class Page {
    /**
     * Path to page, relative to both source and destination
     */
    readonly resPath: string;

    /**
     * Page document
     */
    readonly dom: DocumentNode;

    /**
     * Page body tag (created if the page source didn't have one)
     */
    readonly body: TagNode;

    /**
     * Page head tag (created if the page source didn't have one)
     */
    readonly head: TagNode;

    constructor(resPath: string, dom: DocumentNode) {
        this.resPath = resPath;
        this.dom = dom;

        this.body = getOrCreateTag(dom, 'body');
        this.head = getOrCreateTag(dom, 'head');
    }
}

function getOrCreateTag(dom: DocumentNode, tagName: string): TagNode {
    let tag: TagNode | null = dom.findChildTag((t: TagNode) => t.tagName === tagName);

    if (tag == null) {
        // create new tag to insert
        tag = new TagNode(tagName);

        // find insertion point - either the <html> tag or the dom itself
        const insertionPoint: NodeWithChildren = dom.findChildTag((t: TagNode) => t.tagName === 'html') ?? dom;

        // insert new tag into DOM
        insertionPoint.appendChild(tag);
    }

    return tag;
}
import { TagNode, DocumentNode, NodeWithChildren } from "../../dom/node";
import { Fragment } from "./fragment";

export class Page extends Fragment {
    readonly body: TagNode;
    readonly head: TagNode;

    constructor(resId: string, dom: DocumentNode) {
        super(resId, dom);

        this.body = getOrCreateTag(dom, 'body');
        this.head = getOrCreateTag(dom, 'head');
    }

    clone(): Page {
        // clone the DOM to get a new instance
        const newDom: DocumentNode = this.dom.clone();

        // create new page
        const newPage = new Page(this.resId, newDom);

        return newPage;
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
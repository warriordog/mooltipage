import { DocumentNode, NodeType, TagNode, NodeWithChildren, Node } from '../..';

/**
 * Transform an arbitrary fragment DOM into a valid HTML page.
 * Will create <html>, <head>, <body>, and <title> tags if not already present.
 * Duplicates of those tags will be merged, and the final tags will all be placed in the correct order
 * 
 * @param dom DOM to transform
 */
export function buildPage(dom: DocumentNode): void {
    // extract PIs
    const procIns = dom.findChildNodesByNodeType(NodeType.ProcessingInstruction);
    for (const procIn of procIns) {
        procIn.removeSelf();
    }

    // init head
    const headTag = createHead(dom);

    // init body
    const bodyTag = createBody(dom);

    // get or create html
    const htmlTag = createHtml(dom);

    // remove any left over nodes
    dom.clear();

    // rebuild page
    dom.appendChildren(procIns);
    dom.appendChild(htmlTag);
    htmlTag.appendChild(headTag);
    htmlTag.appendChild(bodyTag);
}

function createHtml(dom: DocumentNode): TagNode {
    const htmlTag = new TagNode('html');

    const sourceHtmlTags = dom.findChildTagsByTagName('html');
    for (const sourceHtml of sourceHtmlTags) {
        // copy children
        htmlTag.appendChildren(sourceHtml.childNodes);

        // copy attributes
        sourceHtml.getAttributes().forEach((value, key) => {
            if (!htmlTag.hasAttribute(key)) {
                htmlTag.setRawAttribute(key, value);
            }
        });

        // remove HTML tag
        sourceHtml.removeSelf();
    }

    // add required "lang" attribute if missing
    if (!htmlTag.hasAttribute('lang')) {
        htmlTag.setAttribute('lang', 'en');
    }

    return htmlTag;
}

// Tags that are only allowed (or should only be used) in the <head> section
const headTags = [
    'style',
    'link',
    'meta',
    'base'
];

function createHead(root: NodeWithChildren): TagNode {
    const headTag = new TagNode('head');

    // extract children of head tags into new head
    for (const existingHead of root.findChildTagsByTagName('head')) {
        // move children
        headTag.appendChildren(existingHead.childNodes);

        // remove the old head when done
        existingHead.removeSelf();
    }

    // move elements that can only exist in the head
    const headContents: Node[] = root.findChildTags((tag: TagNode) => headTags.includes(tag.tagName));
    headTag.appendChildren(headContents);

    // add title if missing
    if (headTag.findChildTagByTagName('title', false) === null) {
        const titleTag = new TagNode('title');
        headTag.appendChild(titleTag);
    }

    return headTag;
}

// Tags that should be "promoted" in the <body> section.
// Promoting a tag means removing it but preserving its children.
const bodyPromoteTags = [
    'html',
    'body'
];

function createBody(root: NodeWithChildren): TagNode {
    const bodyTag = new TagNode('body');

    // copy all remaining elements from dom
    bodyTag.appendChildren(root.childNodes);

    // "promote" children of nested <head> tags
    for (const childBody of bodyTag.findChildTags((tag: TagNode) => bodyPromoteTags.includes(tag.tagName))) {
        childBody.removeSelf(true);
    }

    return bodyTag;
}
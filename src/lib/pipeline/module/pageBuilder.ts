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

    // get or create html
    const htmlTag = createHtml(dom);

    // init head
    const headTag = createHead(htmlTag);
    htmlTag.appendChild(headTag);

    // init body
    const bodyTag = createBody(htmlTag);
    htmlTag.appendChild(bodyTag);

    // remove any left over nodes
    dom.clear();
    htmlTag.clear();

    // rebuild page
    dom.appendChildren(procIns);
    dom.appendChild(htmlTag);
    htmlTag.appendChild(headTag);
    htmlTag.appendChild(bodyTag);
}

function createHtml(dom: DocumentNode): TagNode {
    const htmlTags = dom.findChildTagsByTagName('html');
    if (htmlTags.length > 0) {
        const firstHtml = htmlTags[0];
        firstHtml.removeSelf();

        for (let i = 1; i < htmlTags.length; i++) {
            const currHtml = htmlTags[i];
            currHtml.removeSelf();
            firstHtml.appendChildren(currHtml.childNodes);
        }

        return firstHtml;
    } else {
        return new TagNode('html');
    }
}

// TODO get full list
const headTags: string[] = [
    'style',
    'link',
    'meta',
    'head'
];

function createHead(root: NodeWithChildren): TagNode {
    const headTag = new TagNode('head');

    // copy <head> elements from dom
    const headContents: Node[] = root.findChildTags((tag: TagNode) => headTags.includes(tag.tagName));
    headTag.appendChildren(headContents);

    // "promote" children of nested <head> tags
    for (const childHead of headTag.findChildTagsByTagName('head')) {
        childHead.removeSelf(true);
    }

    // add title if missing
    if (headTag.findChildTagByTagName('title', false) === null) {
        const titleTag = new TagNode('title');
        headTag.appendChild(titleTag);
    }

    return headTag;
}

const bodyPromoteTags: string[] = [
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
import {HtmlCompilerModule, HtmlCompilerContext} from '../htmlCompiler';
import {StyleNode, TagNode} from '../../..';

/**
 * Node tag that indicates that a node has already been processed by DeduplicateModule.
 * Nodes with this tag set will be skipped.
 */
export const NODE_TAG_IS_DEDUPLICATED = 'DeduplicateModule.IsDeduplicated';

/**
 * Removes unnecessary duplicate nodes from the DOM.
 */
export class DeduplicateModule implements HtmlCompilerModule {
    enterNode(htmlContext: HtmlCompilerContext): void {
        const node = htmlContext.node;

        // Don't process nodes more than once.
        // This can happen if a style or link node is generated inside a nested fragment.
        if (!node.nodeTags.has(NODE_TAG_IS_DEDUPLICATED)) {
            // mark as processed
            node.nodeTags.add(NODE_TAG_IS_DEDUPLICATED);

            if (StyleNode.isStyleNode(node)) {
                dedupeStyle(node, htmlContext);

            } else if (TagNode.isTagNode(node) && node.tagName === 'link') {
                dedupeLink(node, htmlContext);
            }
        }
    }
}

/**
 * Removes or remembers a style tag.
 * If the contents of the style are unique, then it is preserved and the contents are remembered.
 * If the contents are not unique, then the node is removed.
 *
 * TODO keep duplicates if they have different MIME types
 *
 * @param styleNode Style node to process
 * @param htmlContext current context
 */
export function dedupeStyle(styleNode: StyleNode, htmlContext: HtmlCompilerContext): void {
    // get the style text from the node.
    // at this point in compilation the only style nodes should be raw (uncompiled) so there should only be 0 or 1 child node
    const styleTextNode = styleNode.firstChildText;

    // check if it contains unique styles
    if (styleTextNode?.hasContent && !htmlContext.pipelineContext.stylesInPage.has(styleTextNode.textContent)) {
        // this style is unique, so save it
        htmlContext.pipelineContext.stylesInPage.add(styleTextNode.textContent);
    } else {
        // if not unique, then cull;
        styleNode.removeSelf();
        htmlContext.setDeleted();
    }
}

/**
 * Removes or remembers a link tag.
 * If the href of the link is unique, then it is preserved and the href are remembered.
 * If the href is not unique, then the node is removed.
 *
 * @param linkNode link tag to process
 * @param htmlContext current context
 */
export function dedupeLink(linkNode: TagNode, htmlContext: HtmlCompilerContext): void {
    // ignore links that don't go anywhere
    if (linkNode.hasValueAttribute('href')) {
        const href = linkNode.getRequiredValueAttribute('href');

        // check if we have seen this link before
        if (htmlContext.pipelineContext.linksInPage.has(href)) {
            // duplicate, so cull it
            linkNode.removeSelf();
            htmlContext.setDeleted();

        } else {
            // unique link, so save it
            htmlContext.pipelineContext.linksInPage.add(href);
        }
    }
}
import {HtmlCompilerModule, HtmlCompilerContext} from '../htmlCompiler';
import {StyleNode, TagNode} from '../../..';

/**
 * Removes unnecessary duplicate nodes from the DOM.
 */
export class DeduplicateModule implements HtmlCompilerModule {
    enterNode(htmlContext: HtmlCompilerContext): void {
        if (StyleNode.isStyleNode(htmlContext.node)) {
            DeduplicateModule.dedupeStyle(htmlContext.node, htmlContext);

        } else if (TagNode.isTagNode(htmlContext.node) && htmlContext.node.tagName === 'link') {
            DeduplicateModule.dedupeLink(htmlContext.node, htmlContext);

        }
    }

    /**
     * Removes or remembers a style tag.
     * If the contents of the style are unique, then it is preserved and the contents are remembered.
     * If the contents are not unique, then the node is removed.
     *
     * @param styleNode Style node to process
     * @param htmlContext current context
     */
    static dedupeStyle(styleNode: StyleNode, htmlContext: HtmlCompilerContext): void {
        // get the style text from the node.
        // at this point in compilation the only style nodes should be raw (uncompiled) so there should only be 0 or 1 child node
        const styleTextNode = styleNode.firstChildText;

        // check if it contains unique styles
        if (styleTextNode != null && styleTextNode.hasContent && !htmlContext.sharedContext.uniqueStyles.has(styleTextNode.textContent)) {
            // this style is unique, so save it
            htmlContext.sharedContext.uniqueStyles.add(styleTextNode.textContent);
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
    static dedupeLink(linkNode: TagNode, htmlContext: HtmlCompilerContext): void {
        // ignore links that don't go anywhere
        if (linkNode.hasValueAttribute('href')) {
            const href = linkNode.getRequiredValueAttribute('href');

            // check if we have seen this link before
            if (htmlContext.sharedContext.uniqueLinks.has(href)) {
                // duplicate, so cull it
                linkNode.removeSelf();
                htmlContext.setDeleted();
            } else {
                // unique link, so save it
                htmlContext.sharedContext.uniqueLinks.add(href)
            }
        }
    }
}
import {
    HtmlCompilerContext,
    HtmlCompilerModule
} from '../htmlCompiler';
import {
    MWhitespaceNode,
    MWhitespaceNodeMode,
    Node,
    NodeWithChildren,
    NodeWithText
} from '../../..';

const NODE_TAG_IS_WHITESPACE_PROCESSED = 'WhitespaceModule.IsWhitespaceProcessed';

/**
 * Compiler module that process whitespace-sensitivity.
 * This module handles <m-whitespace> by setting isWhitespaceSensitive on all child nodes
 */
export class WhitespaceModule implements HtmlCompilerModule {
    exitNode(htmlContext: HtmlCompilerContext): void {
        // if this is an m-whitespace node, then compile
        if (MWhitespaceNode.isMWhitespaceNode(htmlContext.node)) {

            // apply whitespace settings to all children
            const isWhitespaceSensitive = (htmlContext.node.mode === MWhitespaceNodeMode.SENSITIVE);
            applyWhitespaceSettings(isWhitespaceSensitive, htmlContext.node.childNodes);

            // remove node and promote children
            htmlContext.node.removeSelf(true);
        }
    }
}

/**
 * Applies whitespace sensitivity settings to one or more nodes.
 * This function will also tag each processed node as having been processed for whitespace, and will skip nodes that have already been tagged.
 * @param isWhitespaceSensitive If the nodes should be set to
 * @param nodes Nodes to processes, can safely be empty.
 */
function applyWhitespaceSettings(isWhitespaceSensitive: boolean, nodes: Node[]): void {
    // process all nodes
    for (const node of nodes) {

        // Skip nodes that have already been processed for whitespace.
        // This is necessary to support nesting and overriding of <m-whitespace>.
        // Otherwise a parent m-whitespace would overwrite the lower-level settings.
        if (!node.nodeTags.has(NODE_TAG_IS_WHITESPACE_PROCESSED)) {

            // Mark as processed
            node.nodeTags.add(NODE_TAG_IS_WHITESPACE_PROCESSED);

            // if node is a text node, then set whitespace sensitivity
            if (NodeWithText.isNodeWithText(node)) {
                node.isWhitespaceSensitive = isWhitespaceSensitive;
            }

            // process child nodes, if any
            if (NodeWithChildren.isNodeWithChildren(node)) {
                applyWhitespaceSettings(isWhitespaceSensitive, node.childNodes);
            }
        }
    }
}
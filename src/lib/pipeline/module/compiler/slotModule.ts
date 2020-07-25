import { HtmlCompileData, DocumentNode, MSlotNode, HtmlCompilerModule, Node } from "../../..";

/**
 * Processes <m-slot> tags by replacing them with content extracted from <m-content> tags at the point of reference.
 */
export class SlotModule implements HtmlCompilerModule {
    enterNode(node: Node, compileData: HtmlCompileData): void {
        // check if this is a m-slot
        if (MSlotNode.isMSlotNode(node)) {
            // get contents from context, and clone in case slot is repeated
            const content: DocumentNode | undefined = compileData.usageContext.slotContents.get(node.slot)?.clone();

            if (content != undefined) {
                // fill content
                node.replaceSelf(content.childNodes);
            } else {
                // remove slot tag
                node.removeSelf(true);
            }

        }
    }
}
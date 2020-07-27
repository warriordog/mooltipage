import { HtmlCompileData, DocumentNode, MSlotNode, HtmlCompilerModule } from '../../..';

/**
 * Processes <m-slot> tags by replacing them with content extracted from <m-content> tags at the point of reference.
 */
export class SlotModule implements HtmlCompilerModule {
    enterNode(compileData: HtmlCompileData): void {
        // check if this is a m-slot
        if (MSlotNode.isMSlotNode(compileData.node)) {
            // get contents from context, and clone in case slot is repeated
            const content: DocumentNode | undefined = compileData.usageContext.slotContents.get(compileData.node.slot)?.clone();

            if (content != undefined) {
                // fill content
                compileData.node.replaceSelf(content.childNodes);
            } else {
                // remove slot tag
                compileData.node.removeSelf(true);
            }

            // mark as deleted
            compileData.setDeleted();
        }
    }
}
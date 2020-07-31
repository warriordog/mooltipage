import { HtmlCompilerContext, DocumentNode, MSlotNode, HtmlCompilerModule } from '../../..';

/**
 * Processes <m-slot> tags by replacing them with content extracted from <m-content> tags at the point of reference.
 */
export class SlotModule implements HtmlCompilerModule {
    enterNode(htmlContext: HtmlCompilerContext): void {
        // check if this is a m-slot
        if (MSlotNode.isMSlotNode(htmlContext.node)) {
            // get contents from context, and clone in case slot is repeated
            const content: DocumentNode | undefined = htmlContext.pipelineContext.slotContents.get(htmlContext.node.slot)?.clone();

            if (content != undefined) {
                // fill content
                htmlContext.node.replaceSelf(content.childNodes);
            } else {
                // remove slot tag
                htmlContext.node.removeSelf(true);
            }

            // mark as deleted
            htmlContext.setDeleted();
        }
    }
}
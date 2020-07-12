import { CompilerModule, CompileData } from "../htmlCompiler";
import { UsageContext } from "../../pipeline/usageContext";
import { DocumentNode, MSlotNode } from "../../dom/node";

/**
 * Processes <m-slot> tags by replacing them with content extracted from <m-content> tags at the point of reference.
 */
export class SlotModule implements CompilerModule {
    compileFragment(compileData: CompileData): void {
        const dom: DocumentNode = compileData.fragment.dom;
        
        // find slots
        const slots = dom.findChildTagsByTagName('m-slot');

        // process slots
        this.processSlots(slots, compileData.usageContext);
    }

    private processSlots(slots: MSlotNode[], usageContext: UsageContext): void {
        // fill or remove
        for (const slot of slots) {
            // get contents from context, and clone in case slot is repeated
            const content: DocumentNode | undefined = usageContext.slotContents.get(slot.slotName)?.clone();

            if (content != undefined) {
                // fill content
                slot.replaceSelf(...content.childNodes);
            } else {
                // remove slot tag
                slot.removeSelf(true);
            }
        }
    }
}
import { CompilerModule, CompileData } from "../htmlCompiler";
import { Fragment } from "../../pipeline/fragment";
import { UsageContext } from "../../pipeline/usageContext";
import { DocumentNode } from "../../dom/node";

export class SlotModule implements CompilerModule {
    compileFragment?(fragment: Fragment, usageContext: UsageContext, compileData: CompileData): void {
        // fill or remove
        for (const slot of compileData.slots) {
            // get contents from context, and clone in case slot is repeated
            const content: DocumentNode | undefined = usageContext.slotContents.get(slot.name)?.clone();

            if (slot.isAttribute) {
                if (content != undefined) {
                    // fill attribute slot
                    slot.node.appendChildren(content.childNodes);
                } else {
                    // clear attribute slot
                    slot.node.clear();
                }
                
                // delete slot attribute, since slot is processed
                slot.node.attributes.delete('m-slot');
            } else {
                if (content != undefined) {
                    // fill tag slot
                    slot.node.replaceSelf(...content.childNodes);
                } else {
                    // remove tag slot
                    slot.node.removeSelf();
                }
            }
        }
    }
}
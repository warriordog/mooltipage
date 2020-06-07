import { CompilerModule } from "../htmlCompiler";
import { Fragment } from "../../pipeline/fragment";
import { UsageContext } from "../../pipeline/usageContext";
import { DocumentNode, TagNode } from "../../dom/node";

export class SlotModule implements CompilerModule {
    compileFragment(fragment: Fragment, usageContext: UsageContext): void {
        const dom: DocumentNode = fragment.dom;
        
        // find slots
        const slots: Slot[] = this.findSlots(dom);

        // process slots
        this.processSlots(slots, usageContext);
    }

    private findSlots(dom: DocumentNode): Slot[] {
        // find slot nodes
        const slotNodes: TagNode[] = dom.findChildTags((node: TagNode) => node.tagName === 'm-slot' || node.hasAttribute('m-slot'));

        // convert to slots
        const slotObjects: Slot[] = slotNodes.map((slotNode: TagNode) => {
            if (slotNode.tagName === 'm-slot') {
                // create tag slot
                const slotName: string = slotNode.attributes.get('name')?.toLowerCase() ?? '[default]';
                return new Slot(slotName, slotNode, false);
            } else {
                // create attribute slot
                const slotName: string = slotNode.attributes.get('m-slot')?.toLowerCase() ?? '[default]';
                return new Slot(slotName, slotNode, true);
            }
        });

        return slotObjects;
    }

    private processSlots(slots: Slot[], usageContext: UsageContext): void {
        // fill or remove
        for (const slot of slots) {
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

class Slot {
    readonly name: string;
    readonly isAttribute: boolean;
    readonly node: TagNode;

    constructor(name: string, node: TagNode, isAttribute: boolean) {
        this.name = name;
        this.node = node;
        this.isAttribute = isAttribute;
    }
}
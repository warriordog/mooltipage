import { CompilerModule, CompileData } from "../htmlCompiler";
import { UsageContext } from "../../pipeline/usageContext";
import { DocumentNode, TagNode, MSlotNode } from "../../dom/node";

/**
 * Processes <m-slot> tags by replacing them with content extracted from <m-content> tags at the point of reference.
 */
export class SlotModule implements CompilerModule {
    compileFragment(compileData: CompileData): void {
        const dom: DocumentNode = compileData.fragment.dom;
        
        // find slots
        const slots: Slot[] = this.findSlots(dom);

        // process slots
        this.processSlots(slots, compileData.usageContext);
    }

    private findSlots(dom: DocumentNode): Slot[] {
        // list of slots
        const slotObjects: Slot[] = [];

        // get m-slot slots
        this.findMSlotSlots(dom, slotObjects);

        // get standalone slots
        this.findStandaloneSlots(dom, slotObjects);

        return slotObjects;
    }

    private findMSlotSlots(dom: DocumentNode, slotObjects: Slot[]): void {
        // find m-slots
        const mSlots = dom.findChildTags((node: TagNode) => MSlotNode.isMSlotNode(node)) as MSlotNode[];

        // convert m-slots
        for (const mSlot of mSlots) {
            const slotObject = new Slot(mSlot.slotName, mSlot, false);

            slotObjects.push(slotObject);
        }
    }

    private findStandaloneSlots(dom: DocumentNode, slotObjects: Slot[]): void {
        // find standalone slots
        const slotNodes: TagNode[] = dom.findChildTags((node: TagNode) => node.hasAttribute('m-slot'));

        // convert slots
        for (const slot of slotNodes) {
            const slotName = slot.getRequiredAttribute('m-slot') ?? '[default]';

            const slotObject = new Slot(slotName, slot, true);

            slotObjects.push(slotObject);
        }
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
                slot.node.deleteAttribute('m-slot');
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
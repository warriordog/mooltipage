import { DocumentNode } from '../dom/node';

export class UsageContext {
    readonly slotContents: Map<string, DocumentNode>;

    constructor(slotContents?: Map<string, DocumentNode>) {
        this.slotContents = slotContents ?? new Map<string, DocumentNode>();
    }
}
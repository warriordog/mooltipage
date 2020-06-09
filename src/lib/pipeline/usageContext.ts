import { DocumentNode } from '../dom/node';

export class UsageContext {
    readonly slotContents: Map<string, DocumentNode>;
    readonly isPage: boolean;

    constructor(isPage: boolean, slotContents?: Map<string, DocumentNode>) {
        this.isPage = isPage;
        this.slotContents = slotContents ?? new Map<string, DocumentNode>();
    }
}
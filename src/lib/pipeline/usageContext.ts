import { DocumentNode } from '../dom/node';
import { EvalVars } from './evalEngine';
import { Page } from './object/page';

export class UsageContext {
    readonly currentPage: Page;
    readonly slotContents: Map<string, DocumentNode>;
    readonly fragmentParams: EvalVars;

    constructor(currentPage: Page, slotContents?: Map<string, DocumentNode>, fragmentParams?: EvalVars) {
        this.currentPage = currentPage;
        this.slotContents = slotContents ?? new Map();
        this.fragmentParams = fragmentParams ?? new Map();
    }

    createSubContext(slotContents?: Map<string, DocumentNode>, fragmentParams?: EvalVars): UsageContext {
        return new UsageContext(this.currentPage, slotContents, fragmentParams);
    }
}
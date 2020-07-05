import { DocumentNode } from '../dom/node';
import { EvalVars } from './evalEngine';
import { Page } from './object/page';
import { ComponentScriptInstance } from './object/component';

export class UsageContext {
    readonly currentPage: Page;
    readonly slotContents: Map<string, DocumentNode>;
    readonly fragmentParams: EvalVars;
    readonly componentInstance?: ComponentScriptInstance;

    constructor(currentPage: Page, slotContents?: Map<string, DocumentNode>, fragmentParams?: EvalVars, componentInstance?: ComponentScriptInstance) {
        this.currentPage = currentPage;
        this.slotContents = slotContents ?? new Map();
        this.fragmentParams = fragmentParams ?? new Map();
        this.componentInstance = componentInstance;
    }

    createSubContext(slotContents?: Map<string, DocumentNode>, fragmentParams?: EvalVars, componentInstance?: ComponentScriptInstance): UsageContext {
        return new UsageContext(this.currentPage, slotContents, fragmentParams, componentInstance);
    }
}
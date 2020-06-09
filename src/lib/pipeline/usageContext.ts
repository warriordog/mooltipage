import { DocumentNode } from '../dom/node';
import { EvalVars } from './evalEngine';

export class UsageContext {
    readonly isPage: boolean;
    readonly slotContents: Map<string, DocumentNode>;
    readonly fragmentParams: EvalVars;

    constructor(isPage: boolean, slotContents?: Map<string, DocumentNode>, fragmentParams?: EvalVars) {
        this.isPage = isPage;
        this.slotContents = slotContents ?? new Map();
        this.fragmentParams = fragmentParams ?? new Map();
    }
}
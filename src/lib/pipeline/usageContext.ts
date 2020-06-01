import { Dom } from './dom';

export class UsageContext {
    readonly slotContents: Map<string, Dom>;

    constructor(slotContents?: Map<string, Dom>) {
        this.slotContents = slotContents ?? new Map<string, Dom>();
    }
}
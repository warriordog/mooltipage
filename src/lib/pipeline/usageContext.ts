import { DocumentNode, EvalVars, Page, ComponentScriptInstance } from '..';

/**
 * Contextual data regarding the current unit of compilation within the pipeline
 */
export class UsageContext {
    /**
     * Root page that is being compiled
     */
    readonly currentPage: Page;

    /**
     * Slot contents for the current fragment
     */
    readonly slotContents: Map<string, DocumentNode>;

    /**
     * Parameters to the current fragment
     */
    readonly fragmentParams: EvalVars;

    /**
     * Current component instance, if we are in a component context.
     * Otherwise undefined.
     */
    readonly componentInstance?: ComponentScriptInstance;

    constructor(currentPage: Page, slotContents?: Map<string, DocumentNode>, fragmentParams?: EvalVars, componentInstance?: ComponentScriptInstance) {
        this.currentPage = currentPage;
        this.slotContents = slotContents ?? new Map();
        this.fragmentParams = fragmentParams ?? new Map();
        this.componentInstance = componentInstance;
    }

    /**
     * Creates a child context to be used for compiling a referenced resource.
     * Current page and other fixed information will be preserved, but per-fragment data will be replaced.
     * 
     * @param slotContents Slot contents to provide to child context
     * @param fragmentParams Parameters to child context
     * @param componentInstance Component that contains child context, if applicable
     */
    createSubContext(slotContents?: Map<string, DocumentNode>, fragmentParams?: EvalVars, componentInstance?: ComponentScriptInstance): UsageContext {
        return new UsageContext(this.currentPage, slotContents, fragmentParams, componentInstance);
    }
}
import { Pipeline, Fragment, UsageContext, EvalContext, SlotModule, TemplateTextModule, ImportsModule, ReferenceModule, VarsModule, DomLogicModule, EvalScope, Node, NodeWithChildren, DocumentNode } from "../..";

/**
 * Provides HTML compilation support to the pipeline.
 */
export class HtmlCompiler {
    private readonly pipeline: Pipeline;
    private readonly modules: HtmlCompilerModule[];

    /**
     * Create a new instance of the HTML compiler
     * @param pipeline Parent Pipeline instance
     */
    constructor(pipeline: Pipeline) {
        this.pipeline = pipeline;

        this.modules = [
            // TemplateTextModule is responsible for compiling inline expressions.
            // It needs to go before any modules that use attribute or text values
            new TemplateTextModule(),

            // VarsModule is responsible for initializing the scripting / expression scope(s).
            // All other modules have access to local scope, so vars needs to go immediated after template text
            new VarsModule(),

            // SlotModule is responsible for pre-processing the uncompiled DOM to ensure that it contains the final version of the uncompiled input.
            // Incoming slot content may not be fully compiled, and should be compiled as if it is part of this compilation unit.
            new SlotModule(),
            
            // DomLogicModule handles structural logic, like m-if, m-for, etc.
            // This requires scopes to be initalized and expressions to have been evaluated, but needs to run before the DOM is finalized.
            new DomLogicModule(),
            
            // ImportsModule is responsible for converting custom tag names.
            // It needs to go before any modules that use data from tag names
            new ImportsModule(),

            // ReferenceModule is responsible for loading in content that requires a separate compilation round.
            // Content loaded by ReferenceModule is 100% compiled, so it can go last
            new ReferenceModule()
        ];
    }

    /**
     * Compiles a fragment into pure HTML
     * 
     * @param fragment Fragment to compile
     * @param usageContext Current usage context
     */
    compileHtml(fragment: Fragment, usageContext: UsageContext): void {
        // create rootcompile data
        const rootCompileData = new HtmlCompileData(this.pipeline, fragment, usageContext);

        // run modules
        this.runModulesAt(fragment.dom, rootCompileData);
    }

    private runModulesAt(node: Node, parentNodeCompileData: HtmlCompileData): void {
        // create node data
        const compileData = parentNodeCompileData.createChildData();

        // process node
        for (const module of this.modules) {
            if (module.enterNode != undefined) {
                module.enterNode(node, compileData);
            }
        }

        // Process children (children and siblings are already updated by this point)
        // Do not process children if the node has been removed.
        // For most nodes, this can be tested by checking if the parent exists.
        // This does not work for DocumentNode, BUT document node cannot be removed so we just bypass the check.
        if (DocumentNode.isDocumentNode(node) || (node.parentNode != null && NodeWithChildren.isNodeWithChildren(node))) {
            // do a linked search instead of array iteration, because the child list can be modified (such as by m-for)
            let currentChild: Node | null = node.firstChild;
            while (currentChild != null) {
                // save the adjacent siblings, in case the child deletes itself (m-if / similar)
                const savedPrevSibling: Node | null = currentChild.prevSibling;
    
                // process the child
                this.runModulesAt(currentChild, compileData);
    
                // Move on to the next node.
                // To do this correctly, we need to detect if the current node was removed or replaced.
                // If either thing has happened, then we backtrack to the previous node and find the replacement.
                if (currentChild.parentNode !== node) {
                    // If this node was removed or replaced, then find the replacement via savedPrevSibling.
                    // If this was the first child, then just call parentNode.firstChild again to get the replacement.
                    if (savedPrevSibling != null) {
                        // If there is no replacment node, then this will be null and the loop will terminate correctly.
                        currentChild = savedPrevSibling.nextSibling;
                    } else {
                        // There was no previous node, so check get the parent's firstChild and go from there
                        currentChild = node.firstChild;
                    }
                } else {
                    // if the node was not removed or replaced, then move on to next.
                    currentChild = currentChild.nextSibling;
                }
            }
        }

        // cleanup node
        for (const module of this.modules) {
            if (module.exitNode != undefined) {
                module.exitNode(node, compileData);
            }
        }
    }
}

/**
 * A modular component of the HTML compiler
 */
export interface HtmlCompilerModule {
    /**
     * Called when the HTML Compiler begins compiling a node.
     * After all modules have finished their enterNode() section, the node's children will be compiled.
     * 
     * @param node Node being compiled
     * @param compileData Current semi-stateful compilation data
     */
    enterNode?(node: Node, compileData: HtmlCompileData): void;

    /**
     * Called when the HTML Compiler is finished compiling a node and its children.
     * The node can still be modified, however changes will not trickle down to children at this point.
     * 
     * @param node Node being compiled
     * @param compileData Current semi-stateful compilation data
     */
    exitNode?(node: Node, compileData: HtmlCompileData): void;
}

/**
 * Stateful compilation context that is shared between all compiler modules.
 * Forms a tree structure that runs parallel to the DOM
 */
export class HtmlCompileData {
    /**
     * Pipeline instance
     */
    readonly pipeline: Pipeline;

    /**
     * Current fragmnet
     */
    readonly fragment: Fragment;

    /**
     * Current usage context
     */
    readonly usageContext: UsageContext;

    /**
     * HTML Compile data for the parent node, if this node has a parent.
     */
    readonly parentData?: HtmlCompileData;

    /**
     * Registered m-import definitions within this immediate scope.
     * Do not access directly - use instance methods that will additionally check inherited parent data.
     */
    readonly localReferenceImports = new Map<string, ImportDefinition>();

    /**
     * Creates a new HTML compile data instance that optionally inherits from a parent
     * @param pipeline Current pipeline instance
     * @param fragment Fragment being processed
     * @param usageContext Current usage context
     * @param parentData Optional parent HtmlCompileData to inherit from
     */
    constructor(pipeline: Pipeline, fragment: Fragment, usageContext: UsageContext, parentData?: HtmlCompileData) {
        this.pipeline = pipeline;
        this.fragment = fragment;
        this.usageContext = usageContext;
        this.parentData = parentData;
    }

    /**
     * Registers an <m-import> definition for the current node and children
     * Alias will be lower cased.
     * 
     * @param def Import definition
     */
    defineImport(def: ImportDefinition): void {
        const key = def.alias.toLowerCase();
        this.localReferenceImports.set(key, def);
    }

    /**
     * Checks if an alias is a registered <m-import> definition for this node or any parent.
     * Alias will be lower cased.
     * 
     * @param alias Alias (tag name) to check
     * @return true if the alias is defined, false otherwise
     */
    hasImport(alias: string): boolean {
        return hasImport(this, alias);
    }

    /**
     * Gets the definition of a registered <m-import>.
     * Will search local data and all parents.
     * Alias will be lower cased.
     * This method will throw if alias is not defined.
     * Always check hasImport() before calling getImport().
     * 
     * @param alias Alias (tag name) to access.
     * @return The ImportDefinition object for the alias.
     * @throws If alias is not defined.
     */
    getImport(alias: string): ImportDefinition {
        return getImport(this, alias);
    }

    /**
     * Creates an EvalContext that can be used to execute embedded JS in a context matching the current compilation state.
     * @param scope Optional EvalScope to use for script evaluation
     * @returns an EvalContext bound to the data in this HtmlCompileData and the provided scope
     */
    createEvalContext(scope?: EvalScope): EvalContext {
        const evalScope = scope ?? this.usageContext.rootScope;
        return new EvalContext(this.pipeline, this.fragment, this.usageContext, evalScope);
    }

    /**
     * Create a new HtmlCompileData that inherits from this one
     * @returns new HtmlCompileData instance
     */
    createChildData(): HtmlCompileData {
        return new HtmlCompileData(this.pipeline, this.fragment, this.usageContext, this);
    }
}

/**
 * An <m-import> definition
 */
export interface ImportDefinition {
    /**
     * Alias (tag name) that this ImportDefinition defines
     */
    alias: string;

    /**
     * Source path to load import from
     */
    source: string;

    /**
     * Type of import definition.
     * Current supported values:
     * * m-fragment - for an <m-fragment> tag
     * * m-component - for an <m-component> tag
     */
    type: 'm-fragment' | 'm-component';
}

function hasImport(nodeData: HtmlCompileData | undefined, alias: string): boolean {
    const key = alias.toLowerCase();

    while (nodeData != undefined) {
        if (nodeData.localReferenceImports.has(key)) {
            return true;
        }

        nodeData = nodeData.parentData;
    }

    return false;
}

function getImport(nodeData: HtmlCompileData | undefined, alias: string): ImportDefinition {
    const key = alias.toLowerCase();

    while (nodeData != undefined) {

        if (nodeData.localReferenceImports.has(key)) {
            return nodeData.localReferenceImports.get(key) as ImportDefinition;
        }

        nodeData = nodeData.parentData;
    }

    throw new Error(`Alias ${key} is not defined. Always call hasImport() before getImport()`);
}
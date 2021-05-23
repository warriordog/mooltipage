import {ExpressionModule} from './compiler/expressionModule';
import {VarModule} from './compiler/varModule';
import {ScriptModule} from './compiler/scriptModule';
import {SlotModule} from './compiler/slotModule';
import {DomLogicModule} from './compiler/domLogicModule';
import {ImportModule} from './compiler/importModule';
import {FragmentModule} from './compiler/fragmentModule';
import {
    DocumentNode,
    EvalContext,
    Fragment,
    Node,
    NodeWithChildren
} from '../..';
import {StyleModule} from './compiler/styleModule';
import {DeduplicateModule} from './compiler/deduplicateModule';
import {AnchorModule} from './compiler/anchorModule';
import {WhitespaceModule} from './compiler/whitespaceModule';
import {StandardPipelineContext} from '../standardPipeline';

/**
 * Custom tagged template handler to allow promises inside a template string.
 * This should only be called natively by the JS runtime to handle a tagged template.
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates
 * @param stringParts Array of "plain" strings from template literal
 * @param dataParts Array of values from interpolated sections of template literal
 */
export async function interpolateEvalTemplateString(stringParts: TemplateStringsArray, ...dataParts: unknown[]): Promise<string> {
    // Append the first string part
    const outParts = [ stringParts[0] ];

    // Append data and text in alternation
    for (let i = 1; i < stringParts.length; i ++) {
        const rawData = dataParts[i - 1]; // dataParts indexes are -1 from stringParts
        const dataValue = (rawData instanceof Promise) ? (await rawData) : rawData;
        const dataString = String(dataValue);

        // Append data and next string
        outParts.push(dataString);
        outParts.push(stringParts[i]);
    }

    // Build string
    return outParts.join('');
}

/**
 * Provides HTML compilation support to the pipeline.
 */
export class HtmlCompiler {
    private readonly modules: HtmlCompilerModule[];

    /**
     * Create a new instance of the HTML compiler
     */
    constructor() {
        this.modules = [
            // ExpressionsModule is responsible for compiling inline expressions.
            // It needs to go before any modules that use attribute or text values
            new ExpressionModule(),

            // VarsModule is responsible for initializing the scripting / expression scope(s).
            // All other modules have access to local scope, so vars needs to go immediately after template text
            new VarModule(),

            // ScriptsModule executes external or embedded JS scripts
            new ScriptModule(),

            // SlotModule is responsible for pre-processing the uncompiled DOM to ensure that it contains the final version of the uncompiled input.
            // Incoming slot content may not be fully compiled, and should be compiled as if it is part of this compilation unit.
            new SlotModule(),
            
            // DomLogicModule handles structural logic, like m-if, m-for, etc.
            // This requires scopes to be initialized and expressions to have been evaluated, but needs to run before the DOM is finalized.
            new DomLogicModule(),
            
            // ImportsModule is responsible for converting custom tag names.
            // It needs to go before any modules that use data from tag names
            new ImportModule(),

            // StyleModule process <style> tags
            new StyleModule(),

            // DeduplicateModule removes redundant nodes, like duplicate stylesheets and link tags
            new DeduplicateModule(),

            // AnchorModule compiles anchor tags (<a>)
            new AnchorModule(),

            // WhitespaceModule processes whitespace and <m-whitespace>
            new WhitespaceModule(),

            // FragmentModule resolves <m-fragment> references and replaces them with HTML.
            new FragmentModule()
        ];
    }

    /**
     * Processes all custom nodes, logic, expressions, etc in a fragment.
     * Produces a DOM that can be serialized to valid HTML.
     * Does not apply HTML structure rules, such as requiring head / body tags or restricting the position of title elements.
     * 
     * @param fragment Fragment to compile
     * @param pipelineContext Current usage context
     */
    async compileFragment(fragment: Fragment, pipelineContext: StandardPipelineContext): Promise<void> {
        // create root context
        const htmlContext = new HtmlCompilerContext(pipelineContext, fragment.dom);

        // run modules
        await this.runModulesAt(fragment.dom, htmlContext);
    }

    private async runModulesAt(node: Node, parentHtmlContext: HtmlCompilerContext): Promise<void> {
        // create node data
        const htmlContext = parentHtmlContext.createChildData(node);

        // pre-node callback
        for (const module of this.modules) {
            if (module.enterNode !== undefined) {
                // Invoke "enter node" callback, and possibly await it
                const enterPromiseOrVoid = module.enterNode(htmlContext);
                if (enterPromiseOrVoid) await enterPromiseOrVoid;

                // stop processing if node is deleted
                if (htmlContext.isDeleted) {
                    return;
                }
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
                await this.runModulesAt(currentChild, htmlContext);
    
                // Move on to the next node.
                // To do this correctly, we need to detect if the current node was removed or replaced.
                // If either thing has happened, then we backtrack to the previous node and find the replacement.
                if (currentChild.parentNode !== node) {
                    // If this node was removed or replaced, then find the replacement via savedPrevSibling.
                    // If this was the first child, then just call parentNode.firstChild again to get the replacement.
                    if (savedPrevSibling != null) {
                        // If there is no replacement node, then this will be null and the loop will terminate correctly.
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

        // post-node callback
        for (const module of this.modules) {
            if (module.exitNode !== undefined) {
                // Invoke "exit node" callback, and possibly await it
                const exitPromiseOrVoid = module.exitNode(htmlContext);
                if (exitPromiseOrVoid) await exitPromiseOrVoid;

                // stop processing if node is deleted
                if (htmlContext.isDeleted) {
                    return;
                }
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
     * @param htmlContext Current semi-stateful compilation data
     */
    enterNode?(htmlContext: HtmlCompilerContext): void | Promise<void>;

    /**
     * Called when the HTML Compiler is finished compiling a node and its children.
     * The node can still be modified, however changes will not trickle down to children at this point.
     * 
     * @param htmlContext Current semi-stateful compilation data
     */
    exitNode?(htmlContext: HtmlCompilerContext): void | Promise<void>;
}

/**
 * Context for the current node-level unit or work.
 * This is unique for each node being processed.
 */
export class HtmlCompilerContext {
    /**
     * Current usage context
     */
    readonly pipelineContext: StandardPipelineContext;

    /**
     * HTML Compile data for the parent node, if this node has a parent.
     */
    readonly parentContext?: HtmlCompilerContext;

    /**
     * Node currently being compiled
     */
    readonly node: Node;

    /**
     * Registered m-import definitions within this immediate scope.
     * Do not access directly - use instance methods that will additionally check inherited parent data.
     */
    readonly localReferenceImports = new Map<string, ImportDefinition>();

    /**
     * If true, then the node has been deleted and compilation should stop
     */
    get isDeleted(): boolean {
        return this._isDeleted;
    }
    private _isDeleted = false;

    /**
     * Creates a new HTML compile data instance that optionally inherits from a parent
     * @param pipelineContext Pipeline-level shared context
     * @param node Node being compiled
     * @param parentContext Optional parent HtmlCompileData to inherit from
     */
    constructor(pipelineContext: StandardPipelineContext, node: Node, parentContext?: HtmlCompilerContext) {
        this.pipelineContext = pipelineContext;
        this.node = node;
        this.parentContext = parentContext;
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
     * Scope will be initialized from current node data.
     * @returns an EvalContext bound to the data in this HtmlCompileData and the provided scope
     */
    createEvalContext(): EvalContext {
        return {
            pipelineContext: this.pipelineContext,
            scope: this.node.nodeData,
            sourceNode: this.node,
            expressionTagger: interpolateEvalTemplateString
        };
    }

    /**
     * Creates an EvalContext with scope bound to the parent context.
     * If this is a root EvalContext (ie. there is no parent) then the current context will be used.
     * In all other respects this is identical to {@link createEvalContext}.
     *
     * @returns an EvalContext bound to the parent scope
     */
    createParentScopeEvalContext(): EvalContext {
        // if there is a parent context, then use it for the scope
        if (this.parentContext !== undefined) {
            // custom eval context with parent scope but everything else local
            return {
                pipelineContext: this.pipelineContext,
                scope: this.parentContext.node.nodeData,
                sourceNode: this.node,
                expressionTagger: interpolateEvalTemplateString
            };
        } else {
            // fall back to current scope if there is no parent
            return this.createEvalContext();
        }
    }

    /**
     * Create a new HtmlCompileData that inherits from this one
     * @param node node to compile with the new instance
     * @returns new HtmlCompileData instance
     */
    createChildData(node: Node): HtmlCompilerContext {
        return new HtmlCompilerContext(this.pipelineContext, node, this);
    }

    /**
     * Marks the current node as deleted and stops further processing.
     */
    setDeleted(): void {
        this._isDeleted = true;
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
}

function hasImport(htmlContext: HtmlCompilerContext | undefined, alias: string): boolean {
    const key = alias.toLowerCase();

    while (htmlContext !== undefined) {
        if (htmlContext.localReferenceImports.has(key)) {
            return true;
        }

        htmlContext = htmlContext.parentContext;
    }

    return false;
}

function getImport(htmlContext: HtmlCompilerContext | undefined, alias: string): ImportDefinition {
    const key = alias.toLowerCase();

    while (htmlContext !== undefined) {

        if (htmlContext.localReferenceImports.has(key)) {
            return htmlContext.localReferenceImports.get(key) as ImportDefinition;
        }

        htmlContext = htmlContext.parentContext;
    }

    throw new Error(`Alias ${ key } is not defined. Always call hasImport() before getImport()`);
}


import {PipelineContext, ScopeData, Node} from '..';

/**
 * Loads a module using require() relative from the Mooltipage code root
 */
export type MooltipageRequire = (path: string) => unknown;

/**
 * Context available to an evaluated script / expression
 */
export interface EvalContext {
    /**
     * Current pipeline compilation context
     */
    readonly pipelineContext: PipelineContext;

    /**
     * Compiled scope instance, with proper shadowing and overloading applied
     */
    readonly scope: ScopeData;

    /**
     * Node that triggered this script execution.
     * This node can be considered as the "location" of this EvalContext.
     */
    readonly sourceNode: Node;

    /**
     * ES6 template tagging function that will resolve promises in the template.
     * Used internally to implement async template literals.
     */
    readonly expressionTagger: (stringParts: TemplateStringsArray, ...dataParts: unknown[]) => string | Promise<string>;
}

/**
 * A function-based expression
 */
export type EvalFunction<T> = ($: ScopeData, $$: EvalContext, require: MooltipageRequire) => T | Promise<T>;
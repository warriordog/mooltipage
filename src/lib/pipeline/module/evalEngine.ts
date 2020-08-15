import {ScopeData} from '../..';
import {PipelineContext} from '../standardPipeline';

/**
 * regular expression to detect a JS template string literal
 */
const templateTextRegex = /(?<!\\)\${(([^\\}]|\\}|\\)*)}/;

/**
 * regular expression to detect handlebars {{ }}
 */
const handlebarsRegex = /^\s*(?<!\\){{(.*)}}\s*$/;

/**
 * Check if the given string contains embedded JS script(s) that should be executed.
 * @param expression The string to check
 * @returns true if the string contains any recognized expressions
 */
export function isExpressionString(expression: string): boolean {
    // value is template string
    if (templateTextRegex.test(expression)) {
        return true;
    }

    // value is handlebars
    if (handlebarsRegex.test(expression)) {
        return true;
    }

    // value is plain text
    return false;
}

/**
 * Compiles JS code embedded within a string, and then returns a callable function that will return the output of that code.
 * Result object is stateless and can be safely cached and reused.
 * 
 * @param expression The string to compile.
 * @returns an EvalContent that will return the result of the expression
 * @throws if the provided string contains no expressions
 */
export function parseExpression(expression: string): EvalContent<unknown> {
    // value is template string
    if (templateTextRegex.test(expression)) {
        // parse into function
        return parseTemplateString(expression);
    }

    // value is handlebars
    const handlebarsMatches: RegExpMatchArray | null = handlebarsRegex.exec(expression);
    if (handlebarsMatches != null && handlebarsMatches.length === 2) {
        // get JS code from handlebars text
        const handlebarCode: string = handlebarsMatches[1];

        // parse into function
        return parseHandlebars(handlebarCode);
    }

    throw new Error('Attempting to compile plain text as JavaScript');
}

/**
 * Parse an ES6 template literal
 * 
 * @param templateString Contents of the template string, excluding the backticks
 * @returns EvalContent that will execute the template string and return a standard string
 * @throws If the template literal cannot be parsed
 */
export function parseTemplateString(templateString: string): EvalContent<string> {
    // generate function body for template
    const functionBody = `return \`${  templateString  }\`;`;

    // create content
    return parseScript(functionBody);
}

/**
 * Parse a handlebars expression.  Ex. {{ foo() }}
 * 
 * @param jsString Contents of the handlebars expression, excluding the braces
 * @returns EvalContent that will execute the expression and return the resulting object.
 * @throws If the script code cannot be parsed
 */
export function parseHandlebars(jsString: string): EvalContent<unknown> {
    // generate body for function
    const functionBody = `return ${  jsString  };`;

    // create content
    return parseScript(functionBody);
}

/**
 * Parse arbitrary JS code in a function context.
 * All JS features are available, provided that they are valid for use within a function body.
 * The function can optionally return a value, but return values are not type checked.
 * 
 * @param functionBody JS code to execute
 * @returns EvalContent that will execute the expression and return the result of the function, if any.
 * @throws If the JS code cannot be parsed
 */
export function parseScript<T>(functionBody: string): EvalContent<T> {
    try {
        // Parse function body into callable function.
        // This is inherently not type-safe, as the purpose is to run unknown JS code.
        // eslint-disable-next-line @typescript-eslint/no-implied-eval
        const functionObj = new Function('$', '$$', 'require', functionBody) as EvalFunction<T>;

        return new EvalContent(functionObj);
    } catch (error) {
        throw new Error(`Parse error in function: ${ error }. Function body: ${ functionBody }`);
    }
}

/**
 * A parsed, executable JS expression that can be called with a provided evaluation context to produce the result of the expression.
 * Can be safely cached or reused.
 */
export class EvalContent<T> {
    private readonly evalFunction: EvalFunction<T>;

    constructor(evalFunction: EvalFunction<T>) {
        this.evalFunction = evalFunction;
    }

    /**
     * Invoke the expression in the specified content.
     * 
     * @param evalContext Context to execute within
     * @returns The object produced by the expression
     */
    invoke(evalContext: EvalContext): T {
        // execute the function
        return this.evalFunction.call(evalContext.scope, evalContext.scope, evalContext, requireFromRoot);
    }
}

/**
 * Calls node.js require() relatively from the Mooltipage root
 * @param path Path to require
 */
export function requireFromRoot(path: string): unknown {
    if (path.startsWith('./')) {
        path = `../../${ path }`;
    } else if (path.startsWith('.\\')) {
        path = `..\\..\\${ path }`;
    }

    // explicit use of require() is necessary here
    // eslint-disable-next-line @typescript-eslint/no-require-imports,@typescript-eslint/no-var-requires
    return require(path) as unknown;
}

/**
 * Loads a module using require() relative from the Mooltipage code root
 */
export type MooltipageRequire = (path: string) => unknown;

/**
 * A function-based expression
 */
export type EvalFunction<T> = ($: ScopeData, $$: EvalContext, require: MooltipageRequire) => T;

/**
 * Context available to an evaluated script / expression
 */
export class EvalContext {
    /**
     * Current pipeline compilation context
     */
    readonly pipelineContext: PipelineContext;

    /**
     * Compiled scope instance, with proper shadowing and overloading applied
     */
    readonly scope: ScopeData;

    constructor(pipelineContext: PipelineContext, scope: ScopeData) {
        this.pipelineContext = pipelineContext;
        this.scope = scope;
    }
}
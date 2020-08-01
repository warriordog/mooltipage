import { ScopeData, ScopeKey } from '../..';
import { PipelineContext } from '../standardPipeline';

/**
 * regular expression to detect a JS template string litteral
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
        const templateFunc: EvalContent<string> = parseTemplateString(expression);

        // return it
        return templateFunc;
    }

    // value is handlebars
    const handlebarsMatches: RegExpMatchArray | null = expression.match(handlebarsRegex);
    if (handlebarsMatches != null && handlebarsMatches.length === 2) {
        // get JS code from handlebars text
        const handlebarCode: string = handlebarsMatches[1];

        // parse into function
        const handlebarsFunc: EvalContent<unknown> = parseHandlebars(handlebarCode);

        // return it
        return handlebarsFunc;
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
    const evalContent: EvalContent<string> = parseScript(functionBody);

    return evalContent;
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
    const evalContent: EvalContent<unknown> = parseScript(functionBody);

    return evalContent;
}

/**
 * Parse a function-style component script.
 * 
 * @param jsText Text content of the script
 * @returns EvalContent that will execute the expression and return an instance of the component object.
 * @throws If the script code cannot be parsed
 */
export function parseComponentFunction(jsText: string): EvalContent<ScopeData> {
    // generate body for function
    const functionBody = jsText.trim();

    // create content
    return parseScript(functionBody);
}

/**
 * Parse a class-style component script.
 * 
 * @param jsText Text content of the script
 * @returns EvalContent that will execute the expression and return an instance of the component object.
 * @throws If the script cannot be parsed
 */
export function parseComponentClass(jsText: string): EvalContent<ScopeData> {
    // generate body for function
    const functionBody = jsText.trim();

    // parse class declaration
    const classDeclarationFunc = parseNoArgsFunction<EvalConstructor<ScopeData>>(functionBody);

    // execute class declaration
    const classConstructor: EvalConstructor<ScopeData> = classDeclarationFunc();

    // create eval content
    const evalContent = new EvalContentConstructor(classConstructor);

    return evalContent;
}

/**
 * Parse arbitrarty JS code in a function context.
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
        const functionObj = new Function('$', '$$', functionBody) as EvalFunction<T>;

        return new EvalContentFunction(functionObj);
    } catch (error) {
        throw new Error(`Parse error in function: ${ error }. Function body: ${ functionBody }`);
    }
}

function parseNoArgsFunction<T>(functionBody: string): () => T  {
    try {
        return new Function(functionBody) as () => T;
    } catch (error) {
        throw new Error(`Parse error in function: ${ error }.  Function body: ${ functionBody }`);
    }
}

/**
 * A parsed, executable JS expression that can be called with a provided evaluation context to produce the result of the expression.
 * Can be safely cached or reused.
 */
export interface EvalContent<T> {
    /**
     * Invoke the expression in the specified content.
     * 
     * @param evalContext Context to execute within
     * @returns The object produced by the expression
     */
    invoke(evalContext: EvalContext): T;
}

/**
 * A function-based expression
 */
export type EvalFunction<T> = ($: ScopeData, $$: EvalContext) => T;

/**
 * A constructor (class) based expression
 */
export type EvalConstructor<T> = new ($: ScopeData, $$: EvalContext) => T;

/**
 * Implementation of EvalContext that can execute a function
 */
export class EvalContentFunction<T> implements EvalContent<T> {
    protected readonly evalFunction: EvalFunction<T>;

    constructor(evalFunction: EvalFunction<T>) {
        this.evalFunction = evalFunction;
    }

    invoke(evalContext: EvalContext): T {
        // execute the function
        return this.evalFunction(evalContext.scope, evalContext);
    }
}

/**
 * Implementation of EvalContext that can execute a constructor
 */
export class EvalContentConstructor<T> implements EvalContent<T> {
    protected readonly evalConstructor: EvalConstructor<T>;

    constructor(evalConstructor: EvalConstructor<T>) {
        this.evalConstructor = evalConstructor;
    }

    invoke(evalContext: EvalContext): T {
        // execute the function
        return new this.evalConstructor(evalContext.scope, evalContext);
    }
}

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

/**
 * Creates a "root" ScopeData.
 * A root scope is a read-only view into an EvalVars and optional component instance.
 * If included, the component instance will shadow the parameters in the case of conflict.
 * @param parameters EvalVars containing fragment parameters
 * @param componentScope Optional component instance
 */
export function createFragmentScope(parameters: ReadonlyMap<ScopeKey, unknown>, componentScope?: ScopeData): ScopeData {
    const scopeProxyHandler = new ScopeDataProxy(parameters, componentScope);
    return new Proxy(Object.create(null), scopeProxyHandler);
}

class ScopeDataProxy implements ProxyHandler<ScopeData> {
    private readonly parameters: ReadonlyMap<ScopeKey, unknown>;
    private readonly componentScope?: ScopeData;
    
    constructor(parameters: ReadonlyMap<ScopeKey, unknown>, componentScope?: ScopeData) {
        this.parameters = parameters;
        this.componentScope = componentScope;
    }

    get (target: ScopeData, key: PropertyKey): unknown {
        // TS does not support symbols
        if (typeof(key) !== 'symbol') {
            // get from component, if present
            if (this.componentScope?.hasOwnProperty(key)) {
                return this.componentScope[key];
            }

            // otherwise fall back to parameters
            if (this.parameters.has(key)) {
                return this.parameters.get(key);
            }
        }

        return undefined;
    }
}
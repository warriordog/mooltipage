import { ComponentScriptInstance, Pipeline, Fragment, UsageContext } from '../..';

/**
 * Evaluates JS expressions
 */
export class EvalEngine {
    /**
     * Parse an ES6 template literal
     * 
     * @param templateString Contents of the template string, excluding the backticks
     * @returns EvalContent that will execute the template string and return a standard string
     */
    parseTemplateString(templateString: string): EvalContent<string> {
        // generate function body for template
        const functionBody = `return \`${  templateString  }\`;`;

        // create content
        const evalContent: EvalContent<string> = this.createEvalContent(functionBody);

        return evalContent;
    }

    /**
     * Parse a handlebars expression.  Ex. {{ foo() }}
     * 
     * @param jsString Contents of the handlebars expression, excluding the braces
     * @returns EvalContent that will execute the expression and return the resulting object.
     */
    parseHandlebars(jsString: string): EvalContent<unknown> {
        // generate body for function
        const functionBody = `return ${  jsString  };`;

        // create content
        const evalContent: EvalContent<unknown> = this.createEvalContent(functionBody);

        return evalContent;
    }

    /**
     * Parse a function-style component script.
     * 
     * @param jsText Text content of the script
     * @returns EvalContent that will execute the expression and return an instance of the component object.
     */
    parseComponentFunction(jsText: string): EvalContent<ComponentScriptInstance> {
        // generate body for function
        const functionBody = jsText.trim();

        // create content
        const evalContent: EvalContent<ComponentScriptInstance> = this.createEvalContent(functionBody);

        return evalContent;
    }

    /**
     * Parse a class-style component script.
     * 
     * @param jsText Text content of the script
     * @returns EvalContent that will execute the expression and return an instance of the component object.
     */
    parseComponentClass(jsText: string): EvalContent<ComponentScriptInstance> {
        // generate body for function
        const functionBody = jsText.trim();

        // parse class declaration
        const classDeclarationFunc = this.parseNoArgsFunction<EvalConstructor<ComponentScriptInstance>>(functionBody);

        // execute class declaration
        const classConstructor: EvalConstructor<ComponentScriptInstance> = classDeclarationFunc();

        // create eval content
        const evalContent = new EvalContentConstructor(classConstructor);

        return evalContent;
    }

    private createEvalContent<T>(functionBody: string): EvalContent<T> {
        try {
            // Parse function body into callable function.
            // This is inherently not type-safe, as the purpose is to run unknown JS code.
            const functionObj = new Function('$', '$$', functionBody) as EvalFunction<T>;

            return new EvalContentFunction(functionObj);
        } catch (error) {
            throw new Error(`Parse error in function: ${ error }.  Function body: ${ functionBody }`);
        }
    }

    private parseNoArgsFunction<T>(functionBody: string): () => T  {
        try {
            return new Function(functionBody) as () => T;
        } catch (error) {
            throw new Error(`Parse error in function: ${ error }.  Function body: ${ functionBody }`);
        }
    }
}

/**
 * A parsed, executable JS expression that can be called with a provided evaluation context to produce the result of the expression.
 * Can be safely cached or reused.
 */
export interface EvalContent<T> {
    /**
     * Invoke the expression in the specified content.
     * @param evalContext Context to execute within
     * @returns The object produced by the expression
     */
    invoke(evalContext: EvalContext): T;
}

/**
 * A function-based expression
 */
export type EvalFunction<T> = ($: EvalScope, $$: EvalContext) => T;

/**
 * A constructor (class) based expression
 */
export type EvalConstructor<T> = new ($: EvalScope, $$: EvalContext) => T;

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
     * Pipeline instance
     */
    readonly pipeline: Pipeline;

    /**
     * Current fragment being processed
     */
    readonly currentFragment: Fragment;

    /**
     * Current usage context
     */
    readonly usageContext: UsageContext;

    /**
     * Compiled scope instance, with proper shadowing and overloading applied
     */
    readonly scope: EvalScope;

    constructor(pipeline: Pipeline, currentFragment: Fragment, usageContext: UsageContext, scope: EvalScope) {
        this.pipeline = pipeline;
        this.currentFragment = currentFragment;
        this.usageContext = usageContext;
        this.scope = scope;
    }
}

/**
 * Allowable types for property keys for eval scopes
 */
export type EvalKey = string | number;

/**
 * A set of variables that can be provided to a script
 */
export type EvalVars = ReadonlyMap<EvalKey, unknown>;

/**
 * Compiled scope instance that can be used to access all available variables with proper shadowing and overloading
 */
export type EvalScope = Record<EvalKey, unknown>;

/**
 * Creates a "root" EvalScope.
 * A root scope is a read-only view into an EvalVars and optional component instance.
 * If included, the component instance will shadow the parameters in the case of conflict.
 * @param parameters EvalVars containing fragment parameters
 * @param component Optional component instance
 */
export function createRootEvalScope(parameters: EvalVars, component?: ComponentScriptInstance): EvalScope {
    const scopeProxyHandler = new EvalScopeProxy(parameters, component);
    return new Proxy(Object.create(null), scopeProxyHandler);
}

class EvalScopeProxy implements ProxyHandler<EvalScope> {
    private readonly parameters: EvalVars;
    private readonly component?: ComponentScriptInstance;
    
    constructor(parameters: EvalVars, component?: ComponentScriptInstance) {
        this.parameters = parameters;
        this.component = component;
    }

    get (target: EvalScope, key: PropertyKey): unknown {
        // TS does not support symbols
        if (typeof(key) !== 'symbol') {
            // get from component, if present
            if (this.component?.hasOwnProperty(key)) {
                return this.component[key];
            }

            // otherwise fall back to parameters
            if (this.parameters.has(key)) {
                return this.parameters.get(key);
            }
        }

        return undefined;
    }
}
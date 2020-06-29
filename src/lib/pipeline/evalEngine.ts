import { Pipeline } from './pipeline';
import { Fragment } from './object/fragment';
import { UsageContext } from './usageContext';
import { ComponentScriptInstance } from './object/component';

export class EvalEngine {
    evalHandlebars(functionBody: string, context: EvalContext): unknown {
        // parse handlebars
        const evalContent: EvalContent<unknown> = this.parseHandlebars(functionBody);

        // execute
        const result: unknown = evalContent.invoke(context);

        return result;
    }

    parseTemplateString(templateString: string): EvalContent<string> {
        // generate function body for template
        const functionBody: string = 'return `' + templateString + '`;';

        // Parse function body into callable constructor.
        // This is inherently not type-safe, as the purpose is to run unknown JS code.
        const evalFunc = this.createEvalFunction<string>(functionBody);

        // create content
        const evalContent: EvalContent<string> = new EvalContent<string>(evalFunc);

        return evalContent;
    }

    parseHandlebars(jsString: string): EvalContent<unknown> {
        // generate body for function
        const functionBody: string = 'return ' + jsString + ';';

        // parse it
        const evalFunc = this.createEvalFunction<unknown>(functionBody);

        // create content
        const evalContent: EvalContent<unknown> = new EvalContent<unknown>(evalFunc);

        return evalContent;
    }

    private createEvalFunction<T>(functionBody: string): EvalFunction<T> {
        try {
            // Parse function body into callable constructor.
            // This is inherently not type-safe, as the purpose is to run unknown JS code.
            const functionObj: EvalFunction<T> = new Function('$', '$$', functionBody) as EvalFunction<T>;

            return functionObj;
        } catch (error) {
            throw new Error(`Parse error in function: ${ error }.  Function body: ${ functionBody }`);
        }
    }
}

export class EvalContent<T> {
    private readonly evalFunction: EvalFunction<T>;

    constructor(evalFunction: EvalFunction<T>) {
        this.evalFunction = evalFunction;
    }

    invoke(evalContext: EvalContext): T {
        // execute the function
        return this.evalFunction(evalContext.scope, evalContext);
    }
}

export class EvalContext {
    readonly pipeline: Pipeline;
    readonly currentFragment: Fragment;
    readonly usageContext: UsageContext;
    readonly variables: EvalVars;
    readonly parameters: EvalVars;
    readonly scope: EvalScope;

    constructor(pipeline: Pipeline, currentFragment: Fragment, usageContext: UsageContext, variables: EvalVars) {
        this.pipeline = pipeline;
        this.currentFragment = currentFragment;
        this.usageContext = usageContext;
        this.variables = variables;
        this.parameters = usageContext.fragmentParams;
        this.scope = new Proxy({}, new EvalScopeProxy(usageContext.fragmentParams, variables));
    }
}

export type EvalVars = Map<string, unknown>;

export type EvalScope = Record<string, unknown>;

// the vars definition is a lie to make typescript shut up
type EvalFunction<T> = ($: EvalScope, $$: EvalContext) => T;

class EvalScopeProxy implements ProxyHandler<EvalScope> {
    private readonly parameters: EvalVars;
    private readonly variables: EvalVars;
    private readonly component?: ComponentScriptInstance;
    
    constructor(parameters: EvalVars, variables: EvalVars, component?: ComponentScriptInstance) {
        this.parameters = parameters;
        this.variables = variables;
        this.component = component;
    }

    get (target: EvalScope, key: PropertyKey): unknown {
        if (typeof(key) === 'string') {
            if (this.component?.hasOwnProperty(key)) {
                return this.component[key];
            }
            if (this.variables.has(key)) {
                return this.variables.get(key);
            }
            if (this.parameters.has(key)) {
                return this.parameters.get(key);
            }
        }

        return undefined;
    }
}
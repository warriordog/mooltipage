import { Pipeline } from './pipeline';
import { Fragment } from './object/fragment';
import { UsageContext } from './usageContext';
import { ComponentScriptInstance } from './object/component';

export class EvalEngine {

    parseTemplateString(templateString: string): EvalContent<string> {
        // generate function body for template
        const functionBody: string = 'return `' + templateString + '`;';

        // create content
        const evalContent: EvalContent<string> = this.createEvalContent(functionBody);

        return evalContent;
    }

    parseHandlebars(jsString: string): EvalContent<unknown> {
        // generate body for function
        const functionBody: string = 'return ' + jsString + ';';

        // create content
        const evalContent: EvalContent<unknown> = this.createEvalContent(functionBody);

        return evalContent;
    }

    parseComponentFunction(jsText: string): EvalContent<ComponentScriptInstance> {
        // generate body for function
        const functionBody = jsText.trim();

        // create content
        const evalContent: EvalContent<ComponentScriptInstance> = this.createEvalContent(functionBody);

        return evalContent;
    }

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

export interface EvalContent<T> {
    invoke(evalContext: EvalContext): T;
}

export type EvalFunction<T> = ($: EvalScope, $$: EvalContext) => T;
export type EvalConstructor<T> = new ($: EvalScope, $$: EvalContext) => T;

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
        this.scope = new Proxy({}, new EvalScopeProxy(usageContext.fragmentParams, variables, usageContext.componentInstance));
    }
}

export type EvalVars = ReadonlyMap<string, unknown>;

export type EvalScope = Record<string, unknown>;

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
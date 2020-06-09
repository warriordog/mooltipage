import { Pipeline } from './pipeline';
import { Fragment } from './fragment';
import { UsageContext } from './usageContext';

export class EvalEngine {
    evalHandlebars(functionBody: string, context: EvalContext): unknown {
        // parse handlebars
        const evalContent: EvalContent<unknown> = this.parseHandlebars(functionBody, context.scope);

        // execute
        const result: unknown = evalContent.invoke(context);

        return result;
    }

    parseTemplateString(templateString: string, scope: EvalVars): EvalContent<string> {
        // generate function body for template
        const functionBody: string = 'return `' + templateString + '`;';

        // Parse function body into callable constructor.
        // This is inherently not type-safe, as the purpose is to run unknown JS code.
        const evalFunc = this.createEvalFunction<string>(functionBody, scope);

        // create content
        const evalContent: EvalContent<string> = new EvalContent<string>(evalFunc);

        return evalContent;
    }

    parseHandlebars(jsString: string, scope: EvalVars): EvalContent<unknown> {
        // generate body for function
        const functionBody: string = 'return ' + jsString + ';';

        // parse it
        const evalFunc = this.createEvalFunction<unknown>(functionBody, scope);

        // create content
        const evalContent: EvalContent<unknown> = new EvalContent<unknown>(evalFunc);

        return evalContent;
    }

    getFunctionSignature(functionBody: string, scope: EvalVars): string {
        const sigParts: string[] = [ functionBody ];

        for (const varName of scope.keys()) {
            sigParts.push(varName);
        }

        const sig: string = sigParts.join('|');

        return sig;
    }

    private createEvalFunction<T>(functionBody: string, scope: EvalVars): EvalFunction<T> {
        try {
            const scopeKeys: Iterable<string> = scope.keys();

            // Parse function body into callable constructor.
            // This is inherently not type-safe, as the purpose is to run unknown JS code.
            const functionObj: EvalFunction<T> = new Function('$', ...scopeKeys, functionBody) as EvalFunction<T>;

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
        const vars: Iterable<unknown> = evalContext.scope.values();

        // execute the function
        return this.evalFunction(evalContext, ...vars);
    }
}

export class EvalContext {
    readonly pipeline: Pipeline;
    readonly currentFragment: Fragment;
    readonly usageContext: UsageContext;
    readonly variables: EvalVars;
    readonly parameters: EvalVars;
    readonly scope: EvalVars;

    constructor(pipeline: Pipeline, currentFragment: Fragment, usageContext: UsageContext, variables: EvalVars) {
        this.pipeline = pipeline;
        this.currentFragment = currentFragment;
        this.usageContext = usageContext;
        this.variables = variables;
        this.parameters = usageContext.fragmentParams;
        this.scope = buildScope(usageContext.fragmentParams, variables);

    }
}

function buildScope(parameters: EvalVars, variables: EvalVars): EvalVars {
    const scope: EvalVars = new Map(parameters);

    for (const entry of variables) {
        scope.set(entry[0], entry[1]);
    }

    return scope;
}

export type EvalVars = Map<string, unknown>;

// the vars definition is a lie to make typescript shut up
type EvalFunction<T> = ($: EvalContext, ...vars: unknown[]) => T;
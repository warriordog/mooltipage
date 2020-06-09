import { Pipeline } from './pipeline';
import { Fragment } from './fragment';
import { UsageContext } from './usageContext';

export class EvalEngine {
    evalHandlebars(functionBody: string, context: EvalContext): unknown {
        // parse handlebars
        const evalContent: EvalContent<unknown> = this.parseHandlebars(functionBody, context.vars);

        // execute
        const result: unknown = evalContent.invoke(context);

        return result;
    }

    parseTemplateString(templateString: string, vars: EvalVars): EvalContent<string> {
        // generate function body for template
        const functionBody: string = 'return `' + templateString + '`;'

        // Parse function body into callable constructor.
        // This is inherently not type-safe, as the purpose is to run unknown JS code.
        const evalFunc = this.createEvalFunction<string>(functionBody, vars.keys());

        // create content
        const evalContent: EvalContent<string> = new EvalContent<string>(evalFunc);

        return evalContent;
    }

    parseHandlebars(jsString: string, vars: EvalVars): EvalContent<unknown> {
        // generate body for function
        const functionBody: string = 'return ' + jsString + ';';

        // parse it
        const evalFunc = this.createEvalFunction<unknown>(functionBody, vars.keys());

        // create content
        const evalContent: EvalContent<unknown> = new EvalContent<unknown>(evalFunc);

        return evalContent;
    }

    getFunctionSignature(functionBody: string, vars: EvalVars): string {
        const sigParts: string[] = [ functionBody ];

        for (const varName of vars.keys()) {
            sigParts.push(varName);
        }

        const sig: string = sigParts.join('|');

        return sig;
    }

    private createEvalFunction<T>(functionBody: string, params: Iterable<string>): EvalFunction<T> {
        try {
            // Parse function body into callable constructor.
            // This is inherently not type-safe, as the purpose is to run unknown JS code.
            const functionObj: EvalFunction<T> = new Function('$', ...params, functionBody) as EvalFunction<T>;

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
        // get variables as parameters list
        const vars: Iterable<unknown> = evalContext.vars.values();

        // execute the function
        return this.evalFunction(evalContext, ...vars);
    }
}

export interface EvalContext {
    readonly pipeline: Pipeline;
    readonly currentFragment: Fragment;
    readonly usageContext?: UsageContext;
    readonly vars: EvalVars;
}

export type EvalVars = Map<string, unknown>;

// the vars definition is a lie to make typescript shut up
type EvalFunction<T> = ($: EvalContext, ...vars: unknown[]) => T;
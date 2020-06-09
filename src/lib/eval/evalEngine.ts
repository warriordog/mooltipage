import { Pipeline } from '../pipeline/pipeline';
import { Fragment } from '../pipeline/fragment';
import { UsageContext } from '../pipeline/usageContext';

// the vars definition is a lie to make typescript shut up
export type EvalFunction<T> = ($: EvalContext, ...vars: unknown[]) => T;

export class EvalEngine {
    executeFunction<T>(func: EvalFunction<T>, context: EvalContext): T {
        return func(context, ...context.vars.values());
    }

    evalHandlebars(functionBody: string, context: EvalContext): unknown {
        // parse handlebars
        const functionObj: EvalFunction<unknown> = this.parseHandlebars(functionBody, context.vars);

        // execute
        const result: unknown = this.executeFunction(functionObj, context);

        return result;
    }

    parseTemplateString(templateString: string, vars: EvalVars): EvalFunction<string> {
        // TODO escape `
        // generate function body for template
        const functionBody: string = 'return `' + templateString + '`;'

        // Parse function body into callable constructor.
        // This is inherently not type-safe, as the purpose is to run unknown JS code.
        const functionObj = this.createEvalFunction<string>(functionBody, vars.keys());

        return functionObj;
    }

    parseHandlebars(jsString: string, vars: EvalVars): EvalFunction<unknown> {
        const functionBody: string = 'return ' + jsString + ';';

        const functionObj = this.createEvalFunction<unknown>(functionBody, vars.keys());

        return functionObj;
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

export interface EvalContext {
    readonly pipeline: Pipeline;
    readonly currentFragment: Fragment;
    readonly usageContext?: UsageContext;
    readonly vars: EvalVars;
}

export type EvalVars = Map<string, unknown>;
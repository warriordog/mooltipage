import { EvalContext } from './evalContext';
import { EvalFunction } from './evalFunction';

export class EvalEngine {
    executeFunction<T>(func: EvalFunction<T>, context: EvalContext): T {
        return func(context.pipeline, context.currentFragment, context.currentPage);
    }

    // TODO remove matches
    parseTemplateString(templateString: string): EvalFunction<string> {
        // generate function body for template
        const functionBody: string = 'return `' + templateString + '`;'

        // Parse function body into callable constructor.
        // This is inherently not type-safe, as the purpose is to run unknown JS code.
        const functionObj: EvalFunction<string> = new Function('pipeline', 'currentFragment', 'currentPage', functionBody) as EvalFunction<string>;

        return functionObj;
    }
}
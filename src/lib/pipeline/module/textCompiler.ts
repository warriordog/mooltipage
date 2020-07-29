import { EvalContent, EvalEngine } from '../..';

/**
 * Compiles DOM text for the pipeline.
 * Handles recognizition and execution of embedded JS code.
 */
export class TextCompiler {
    private readonly evalEngine: EvalEngine;

    constructor() {
        this.evalEngine = new EvalEngine();
    }

    /**
     * Check if the given string contains embedded JS script(s) that should be executed.
     * @param value The string to check
     * @returns true if the string contains any recognized expressions
     */
    isExpression(value: string): boolean {
        // value is template string
        if (templateTextRegex.test(value)) {
            return true;
        }

        // value is handlebars
        if (handlebarsRegex.test(value)) {
            return true;
        }

        // value is plain text
        return false;
    }

    /**
     * Compiles JS code embedded within a string, and then returns a callable function that will return the output of that code.
     * Result object is stateless and can be safely cached and reused.
     * 
     * @param value The string to compile.
     * @returns an EvalContent that will return the result of the expression
     * @throws if the provided string contains no expressions
     */
    compileExpression(value: string): EvalContent<unknown> {
        // value is template string
        if (templateTextRegex.test(value)) {
            // parse into function
            const templateFunc: EvalContent<string> = this.evalEngine.parseTemplateString(value);
    
            // return it
            return templateFunc;
        }

        // value is handlebars
        const handlebarsMatches: RegExpMatchArray | null = value.match(handlebarsRegex);
        if (handlebarsMatches != null && handlebarsMatches.length === 2) {
            // get JS code from handlebars text
            const handlebarCode: string = handlebarsMatches[1];

            // parse into function
            const handlebarsFunc: EvalContent<unknown> = this.evalEngine.parseHandlebars(handlebarCode);

            // return it
            return handlebarsFunc;
        }

        throw new Error('Attempting to compile plain text as JavaScript');
    }
}

/**
 * regular expression to detect a JS template string litteral
 */
const templateTextRegex = /(?<!\\)\${(([^\\}]|\\}|\\)*)}/;

/**
 * regular expression to detect handlebars {{ }}
 */
const handlebarsRegex = /^\s*(?<!\\){{(.*)}}\s*$/;
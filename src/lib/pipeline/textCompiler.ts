import { EvalContent, EvalEngine } from "./evalEngine";

export class TextCompiler {
    private readonly evalEngine: EvalEngine;

    constructor() {
        this.evalEngine = new EvalEngine();
    }

    isScriptText(value: string): boolean {
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

    compileScriptText(value: string): EvalContent<unknown> {
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

// regular expression to detect a JS template string litteral
export const templateTextRegex = /(?<!\\)\${(([^\\}]|\\}|\\)*)}/;

// regular expression to detect handlebars {{ }}
export const handlebarsRegex = /^\s*(?<!\\){{(.*)}}\s*$/;
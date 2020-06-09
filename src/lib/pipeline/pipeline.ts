import { Fragment } from "./fragment";
import { UsageContext } from "./usageContext";
import { EvalContent, EvalContext } from "./evalEngine";

export interface Pipeline {
    compileFragment(resId: string, usageContext: UsageContext): Fragment

    compilePage(resId: string): Fragment;

    compileTemplateString(templateText: string, evalContext: EvalContext): EvalContent<string>;

    compileHandlebars(handlebarsText: string, evalContext: EvalContext): EvalContent<unknown>;

    reset(): void;
}
import { CompilerModule, CompileData } from "../htmlCompiler";
import { TagNode, DocumentNode } from "../../dom/node";
import { Fragment } from "../../pipeline/fragment";
import { Page } from "../../pipeline/page";
import { UsageContext } from "../../pipeline/usageContext";
import { Pipeline } from "../../pipeline/pipeline";
import { EvalEngine } from "../../eval/evalEngine";
import { EvalContext } from "../../eval/evalContext";

const handlebarsRegex = /^\s*(?<!\\){{(.*)}}\s*$/;

export class VarsModule implements CompilerModule {
    private readonly evalEngine: EvalEngine;
    private readonly pipeline: Pipeline;

    constructor(pipeline: Pipeline) {
        this.pipeline = pipeline;
        this.evalEngine = new EvalEngine();
    }

    compileFragment(fragment: Fragment, compileData: CompileData, usageContext: UsageContext): void {
        this.processVars(fragment, compileData, usageContext);
    }

    compilePage(page: Page, compileData: CompileData): void {
        this.processVars(page, compileData);
    }

    private processVars(fragment: Fragment, compileData: CompileData, usageContext?: UsageContext): void {
        // find all vars
        const varElems: TagNode[] = this.findVarElems(fragment.dom);

        // create eval context
        const evalContext: EvalContext = {
            pipeline: this.pipeline,
            currentFragment: fragment,
            usageContext: usageContext,
            vars: compileData.vars
        }

        // compute values
        const varValues: Map<string, unknown> = this.getVarValues(varElems, evalContext);

        // save in compile data
        compileData.vars = varValues;

        // remove from DOM
        this.removeVarElems(varElems);
    }

    private getVarValues(varElems: TagNode[], evalContext: EvalContext): Map<string, unknown> {
        const varValues: Map<string, unknown> = new Map();

        for (const elem of varElems) {
            for (const attr of elem.attributes) {
                const key: string = attr[0];
                const value: string | null = attr[1];

                // compute real value
                const varValue = this.computeVarValue(value, evalContext);

                varValues.set(key, varValue);
            }
        }

        return varValues;
    }

    private computeVarValue(value: string | null, evalContext: EvalContext): unknown {
        if (value == null) {
            return null;
        }
        
        const matches: RegExpMatchArray | null = value.match(handlebarsRegex);

        if (matches == null || matches.groups == null || matches.length != 2) {
            return value;
        }

        // JS regex is weird
        const functionBody: string = matches[1];

        // execute
        const varValue: unknown = this.evalEngine.evalHandlebars(functionBody, evalContext);

        return varValue;
    }

    private findVarElems(dom: DocumentNode): TagNode[] {
        return dom.findChildTags((tag: TagNode) => tag.tagName === 'm-var');
    }

    private removeVarElems(varElems: TagNode[]): void {
        for (const elem of varElems) {
            elem.removeSelf();
        }
    }
}
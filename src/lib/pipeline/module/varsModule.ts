import { CompilerModule, CompileData } from "../htmlCompiler";
import { TagNode, DocumentNode } from "../../dom/node";
import { EvalContext } from "../evalEngine";

export class VarsModule implements CompilerModule {

    compileFragment(compileData: CompileData): void {
        // find all vars
        const varElems: TagNode[] = this.findVarElems(compileData.fragment.dom);
        
        // only process if there are any vars
        if (varElems.length > 0) {
    
            // create eval context
            const evalContext: EvalContext = compileData.createEvalContext();
    
            // compute values
            const varValues: Map<string, unknown> = this.getVarValues(compileData, varElems, evalContext);
    
            // save in compile data
            compileData.vars = varValues;
    
            // remove from DOM
            this.removeVarElems(varElems);
        }
    }

    private getVarValues(compileData: CompileData, varElems: TagNode[], evalContext: EvalContext): Map<string, unknown> {
        const varValues: Map<string, unknown> = new Map();

        for (const elem of varElems) {
            for (const attr of elem.attributes) {
                const key: string = attr[0];
                const value: string | null = attr[1];

                // compute real value
                const varValue = compileData.pipeline.compileDomText(value, evalContext);

                varValues.set(key, varValue);
            }
        }

        return varValues;
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
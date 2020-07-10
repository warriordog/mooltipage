import { CompilerModule, CompileData } from "../htmlCompiler";
import { TagNode, DocumentNode, MVarNode } from "../../dom/node";
import { EvalContext } from "../evalEngine";

export class VarsModule implements CompilerModule {

    compileFragment(compileData: CompileData): void {
        // find all vars
        const varElems: MVarNode[] = this.findVarElems(compileData.fragment.dom);
        
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

    private getVarValues(compileData: CompileData, varNodes: MVarNode[], evalContext: EvalContext): Map<string, unknown> {
        const varValues: Map<string, unknown> = new Map();

        for (const mVar of varNodes) {
            for (const variable of mVar.variables.entries()) {
                const varName: string = variable[0];
                const srcValue: string | null = variable[1];

                // compute real value
                const varValue = compileData.pipeline.compileDomText(srcValue, evalContext);

                varValues.set(varName, varValue);
            }
        }

        return varValues;
    }

    private findVarElems(dom: DocumentNode): MVarNode[] {
        return dom.findChildTags((tag: TagNode) => MVarNode.isMVarNode(tag)) as MVarNode[];
    }

    private removeVarElems(varElems: TagNode[]): void {
        for (const elem of varElems) {
            elem.removeSelf();
        }
    }
}
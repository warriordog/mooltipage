import { CompilerModule, CompileData } from "../htmlCompiler";
import { Pipeline } from "../../pipeline/pipeline";
import { Fragment } from "../../pipeline/fragment";
import { Page } from "../../pipeline/page";
import { UsageContext } from "../../pipeline/usageContext";

export class FragmentModule implements CompilerModule {
    private readonly pipeline: Pipeline;

    constructor(pipeline: Pipeline) {
        this.pipeline = pipeline;
    }

    compileFragment?(fragment: Fragment, usageContext: UsageContext, compileData: CompileData): void {
        this.processFragments(compileData);
    }

    compilePage?(page: Page, compileData: CompileData): void {
        this.processFragments(compileData);
    }

    private processFragments(compileData: CompileData): void {
        // process each fragment
        for (const fragment of compileData.fragmentRefs) {
            // create usage context
            const usageContext = new UsageContext(fragment.slotContents);

            // call pipeline to load fragment
            const compiledContents: Fragment = this.pipeline.compileFragment(fragment.sourceResId, usageContext);

            // replace with compiled fragment
            fragment.node.replaceSelf(...compiledContents.dom.childNodes)
        }
    }
}
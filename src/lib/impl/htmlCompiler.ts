import { Pipeline } from "../pipeline/pipeline";
import { Fragment } from "../pipeline/fragment";
import { Page } from "../pipeline/page";
import { UsageContext } from '../pipeline/usageContext';
import { SlotModule } from "./module/slotModule";
import { FragmentModule } from "./module/fragmentModule";
import { TemplateTextModule } from "./module/templateTextModule";

export class HtmlCompiler {
    private readonly pipeline: Pipeline;
    private readonly modules: CompilerModule[];

    constructor(pipeline: Pipeline) {
        this.pipeline = pipeline;

        // these are order-specific!
        // FragmentModule splits up the DOM and would hide elements from the other steps
        this.modules = [
            new SlotModule(),
            new TemplateTextModule(pipeline),
            new FragmentModule(pipeline)
        ];
    }

    compileFragment(fragment: Fragment, usageContext: UsageContext): void {
        // run modules
        for (const module of this.modules) {
            if (module.compileFragment != undefined) {
                module.compileFragment(fragment, usageContext);
            }
        }
    }

    compilePage(page: Page): void {
        // run modules
        for (const module of this.modules) {
            if (module.compilePage != undefined) {
                module.compilePage(page);
            }
        }
    }
}

export interface CompilerModule {
    compileFragment?(fragment: Fragment, usageContext: UsageContext): void;
    compilePage?(page: Page): void;
}


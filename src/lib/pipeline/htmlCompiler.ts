import { Pipeline } from "./pipeline";
import { Fragment } from "./fragment";
import { UsageContext } from './usageContext';
import { SlotModule } from "./module/slotModule";
import { FragmentModule } from "./module/fragmentModule";
import { TemplateTextModule } from "./module/templateTextModule";
import { VarsModule } from "./module/varsModule";
import { EvalContext } from "./evalEngine";

export class HtmlCompiler {
    private readonly pipeline: Pipeline;
    private readonly modules: CompilerModule[];

    constructor(pipeline: Pipeline) {
        this.pipeline = pipeline;

        // these are order-specific!
        // FragmentModule splits up the DOM and would hide elements from the other steps
        this.modules = [
            new SlotModule(),
            new VarsModule(),
            new TemplateTextModule(),
            new FragmentModule()
        ];
    }

    compileFragment(fragment: Fragment, usageContext: UsageContext): void {
        // create compile data
        const compileData: CompileData = new CompileData(this.pipeline, fragment, usageContext);

        // run modules
        for (const module of this.modules) {
            module.compileFragment(compileData);
        }
    }
}

export interface CompilerModule {
    compileFragment(compileData: CompileData): void;
}

export class CompileData {
    readonly pipeline: Pipeline;
    readonly fragment: Fragment;
    readonly usageContext: UsageContext;

    vars: Map<string, unknown> = new Map();

    constructor(pipeline: Pipeline, fragment: Fragment, usageContext: UsageContext) {
        this.pipeline = pipeline;
        this.fragment = fragment;
        this.usageContext = usageContext;
    }

    createEvalContext(): EvalContext {
        return new EvalContext(this.pipeline, this.fragment, this.usageContext, this.vars);
    }
}
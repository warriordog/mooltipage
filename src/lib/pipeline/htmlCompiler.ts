import { Pipeline } from "./pipeline";
import { Fragment } from "./object/fragment";
import { UsageContext } from './usageContext';
import { SlotModule } from "./module/slotModule";
import { ReferenceModule } from "./module/referenceModule";
import { TemplateTextModule } from "./module/templateTextModule";
import { VarsModule } from "./module/varsModule";
import { EvalContext } from "./evalEngine";
import { ImportsModule } from "./module/importsModule";

export class HtmlCompiler {
    private readonly pipeline: Pipeline;
    private readonly modules: CompilerModule[];

    constructor(pipeline: Pipeline) {
        this.pipeline = pipeline;

        // These are order-specific! See the comments for details.
        this.modules = [
            // SlotModule is responsible for pre-processing the uncompiled DOM to ensure that it contains the final version of the uncompiled input.
            // It changes the pre-compiled DOM, so it needs to run first.
            // Incomming slot content may not be fully compiled, and should be compiled as if it is part of this compilation unit.
            new SlotModule(),

            // !! New pre-compile DOM manipulation goes here

            // VarsModule is responsible for initializing the scripting / expression scope.
            // All other modules have access to local scope, so vars needs to go next.
            // It runs pre-scope, so it has no dependency on TemplateText
            new VarsModule(),

            // !! New scope processing goes here

            // TemplateTextModule is responsible for compiling inline expressions.
            // It needs to go before any modules that use data from attributes, except vars.
            new TemplateTextModule(), 

            // !! New attribute / text processing goes here

            // ImportsModule is responsible for converting custom tag names.
            // It needs to go before any modules that use data from tag names
            new ImportsModule(),

            // !! New element processing goes here

            // ReferenceModule is responsible for loading in content that requires a separate compilation round.
            // Content loaded by ReferenceModule is 100% compiled.
            new ReferenceModule()

            // !! New external processing goes here
        ];
    }

    compileHtml(fragment: Fragment, usageContext: UsageContext): void {
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
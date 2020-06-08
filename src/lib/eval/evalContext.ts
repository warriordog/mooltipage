import { Pipeline } from "../pipeline/pipeline";
import { Fragment } from "../pipeline/fragment";
import { UsageContext } from "../pipeline/usageContext";

export interface EvalContext {
    readonly pipeline: Pipeline;
    readonly currentFragment: Fragment;
    readonly usageContext?: UsageContext;
    readonly vars: EvalVars;
}

export type EvalVars = Map<string, unknown>;
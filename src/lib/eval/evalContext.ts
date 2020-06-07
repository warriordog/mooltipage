import { Pipeline } from "../pipeline/pipeline";
import { Fragment } from "../pipeline/fragment";
import { Page } from "../pipeline/page";

export interface EvalContext {
    readonly pipeline: Pipeline;
    readonly currentFragment: Fragment;
    readonly currentPage: Page | null;
}
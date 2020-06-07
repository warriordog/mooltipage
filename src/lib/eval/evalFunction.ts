import { Pipeline } from "../pipeline/pipeline";
import { Fragment } from "../pipeline/fragment";
import { Page } from "../pipeline/page";

export type EvalFunction<T> = (pipeline: Pipeline, currentFragment: Fragment, currentPage: Page | null) => T;
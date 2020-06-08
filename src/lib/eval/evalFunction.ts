import { EvalContext } from "./evalContext";

// the vars definition is a lie to make typescript shut up
export type EvalFunction<T> = ($: EvalContext, ...vars: unknown[]) => T;
import { Fragment } from "./fragment";
import { Page } from "./page";
import { UsageContext } from "./usageContext";

export interface Pipeline {
    compileFragment(resId: string, usageContext: UsageContext): Fragment

    compilePage(resId: string): Page;

    reset(): void;
}
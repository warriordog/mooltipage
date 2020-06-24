import { Fragment } from "./object/fragment";
import { UsageContext } from "./usageContext";

export interface HtmlFormatter {
    formatFragment(fragment: Fragment, usageContext: UsageContext): void;
    formatHtml(resId: string, html: string): string;
}
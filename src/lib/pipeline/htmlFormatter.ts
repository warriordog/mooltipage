import { Fragment } from "./object/fragment";
import { Page } from "./object/page";
import { UsageContext } from "./usageContext";

export interface HtmlFormatter {
    formatFragment?(fragment: Fragment, usageContext: UsageContext): void;
    formatPage?(page: Page): void;
    formatHtml?(resPath: string, html: string): string;
}
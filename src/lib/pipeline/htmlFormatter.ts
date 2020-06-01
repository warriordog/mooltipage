import { Fragment } from "./fragment";
import { Page } from "./page";

export interface HtmlFormatter {
    formatFragment(fragment: Fragment): void;
    formatPage(page: Page): void;
    formatHtml(resId: string, html: string): string;
}
import { Fragment, UsageContext, Page } from "..";

/**
 * Provides HTML formatting support to the pipeline.
 * All methods are optional.
 */
export interface HtmlFormatter {
    /**
     * Formats a fragment before insertion into a page.
     * Optional.
     * 
     * @param fragment Fragment to format
     * @param usageContext Current usage context
     */
    formatFragment?(fragment: Fragment, usageContext: UsageContext): void;

    /**
     * Formats a page before serialization.
     * Optional.
     * 
     * @param page Page to format
     */
    formatPage?(page: Page): void;

    /**
     * Formats serialized HTML before being exported from the pipeline.
     * Optional.
     * 
     * @param resPath Path to the resource that produced this HTML
     * @param html HTML to format.
     */
    formatHtml?(resPath: string, html: string): string;
}
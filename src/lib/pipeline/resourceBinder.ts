import { UsageContext } from "./usageContext";
import { TextNode, TagNode } from "../dom/node";
import { Pipeline } from "./pipeline";
import { ResourceType } from "./pipelineInterface";

export class ResourceBinder {
    private readonly pipeline: Pipeline;

    constructor(pipeline: Pipeline) {
        this.pipeline = pipeline;
    }

    bindStyle(resId: string, styleContent: string, bindType: StyleBindType, usageContext: UsageContext): void {
        switch (bindType) {
            case StyleBindType.HEAD: {
                this.bindStyleHead(styleContent, usageContext);
                break;
            }
            case StyleBindType.LINK: {
                this.bindStyleLink(styleContent, usageContext, resId);
                break;
            }
            default: {
                throw new Error(`Unable to bind style '${resId}': Unsupported component bind type: '${bindType}'`);
            }
        }
    }

    private bindStyleHead(styleContent: string, usageContext: UsageContext): void {
        // wrap styles in text node
        const styleText: TextNode = new TextNode(styleContent);

        // create style tag
        const styleTag: TagNode = new TagNode('style');

        // append text to style
        styleTag.appendChild(styleText);

        // append style to page
        usageContext.currentPage.head.appendChild(styleTag);
    }

    private bindStyleLink(styleContent: string, usageContext: UsageContext, sourceResId: string): void {
        // link to project
        const styleResId = this.pipeline.linkResource(ResourceType.CSS, styleContent, sourceResId);

        // create link tag
        const link = new TagNode('link');
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('href', styleResId);

        // append link to page
        usageContext.currentPage.head.appendChild(link);
    }
}

/**
 * Recognised binding types for stylesheets
 */
export enum StyleBindType {
    /**
     * Stylesheet will be placed in an inline <style> block in the page <head> section.
     */
    HEAD = 'head',

    /**
     * Stylesheet will be placed in an external CSS file and referenced via a <link> tag.
     */
    LINK = 'link'
}
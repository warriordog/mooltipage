import { Pipeline, UsageContext, TextNode, TagNode, ResourceType } from '../..';

/**
 * Provides embedded and external resource binding to the pipeline.
 */
export class ResourceBinder {
    private readonly pipeline: Pipeline;

    constructor(pipeline: Pipeline) {
        this.pipeline = pipeline;
    }

    /**
     * Binds CSS styles to the current page.
     * 
     * @param resPath Path to the style resource
     * @param styleContent CSS text content
     * @param bindType Type of binding to use
     * @param usageContext Current usage context
     */
    bindStyle(resPath: string, styleContent: string, bindType: StyleBindType, usageContext: UsageContext): void {
        switch (bindType) {
            case StyleBindType.HEAD: {
                this.bindStyleHead(styleContent, usageContext);
                break;
            }
            case StyleBindType.LINK: {
                this.bindStyleLink(styleContent, usageContext, resPath);
                break;
            }
            default: {
                throw new Error(`Unable to bind style '${ resPath }': Unsupported component bind type: '${ bindType }'`);
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

    private bindStyleLink(styleContent: string, usageContext: UsageContext, sourceResPath: string): void {
        // link to project
        const styleResPath = this.pipeline.linkResource(ResourceType.CSS, styleContent, sourceResPath);

        // create link tag
        const link = new TagNode('link');
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('href', styleResPath);

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
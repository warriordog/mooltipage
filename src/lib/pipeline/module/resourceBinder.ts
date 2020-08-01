import { DocumentNode, TextNode, TagNode, ResourceType } from '../..';
import { StandardPipeline, PipelineContext } from '../standardPipeline';

/**
 * Binds CSS styles to the current page.
 * 
 * @param resPath Path to the style resource
 * @param styleContent CSS text content
 * @param bindType Type of binding to use
 * @param pipelineContext current pipeline context
 */
export function bindStyle(resPath: string, styleContent: string, bindType: StyleBindType, pipelineContext: PipelineContext): void {
    switch (bindType) {
        case StyleBindType.HEAD: {
            bindStyleHead(styleContent, pipelineContext.fragment.dom);
            break;
        }
        case StyleBindType.LINK: {
            bindStyleLink(styleContent, pipelineContext.fragment.dom, pipelineContext.pipeline, resPath);
            break;
        }
        default: {
            throw new Error(`Unable to bind style '${ resPath }': Unsupported component bind type: '${ bindType }'`);
        }
    }
}

function bindStyleHead(styleContent: string, dom: DocumentNode): void {
    // wrap styles in text node
    const styleText: TextNode = new TextNode(styleContent);

    // create style tag
    const styleTag: TagNode = new TagNode('style');

    // append text to style
    styleTag.appendChild(styleText);

    // append style to page
    const head = getOrCreateHead(dom);
    head.appendChild(styleTag);
}

function bindStyleLink(styleContent: string, dom: DocumentNode, pipeline: StandardPipeline, sourceResPath: string): void {
    // link to project
    const styleResPath = pipeline.linkResource(ResourceType.CSS, styleContent, sourceResPath);

    // create link tag
    const link = new TagNode('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', styleResPath);

    // append link to page
    const head = getOrCreateHead(dom);
    head.appendChild(link);
}

function getOrCreateHead(dom: DocumentNode): TagNode {
    let head = dom.findChildTagByTagName('head');
    if (head == null) {
        head = new TagNode('head');
        dom.appendChild(head);
    }
    return head;
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
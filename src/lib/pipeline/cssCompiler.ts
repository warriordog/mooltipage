import { ComponentStyle, ComponentStyleBindType, Component } from "./object/component";
import { UsageContext } from "./usageContext";
import { TextNode, TagNode } from "../dom/node";

export class CssCompiler {
    compileComponentStyle(component: Component, style: ComponentStyle, usageContext: UsageContext): void {
        switch (style.bindType) {
            case ComponentStyleBindType.HEAD: {
                this.compileComponentStyleHead(style, usageContext);
                break;
            }
            case ComponentStyleBindType.LINK: {
                throw new Error('LINK style bind type is not implemented');
            }
            default: {
                throw new Error(`Error in component '${component.resId}': Unsupported component <style> bind type: '${style.bindType}'`);
            }
        }
    }

    private compileComponentStyleHead(style: ComponentStyle, usageContext: UsageContext): void {
        // wrap styles in text node
        const styleText: TextNode = new TextNode(style.styleContent);

        // create style tag
        const styleTag: TagNode = new TagNode('style');

        // append text to style
        styleTag.appendChild(styleText);

        // append style to page
        usageContext.currentPage.head.appendChild(styleTag);
    }
}
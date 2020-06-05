import { CompilerModule } from "../htmlCompiler";
import { Node, TagNode, TextNode, DocumentNode } from "../../dom/node";
import { Fragment } from "../../pipeline/fragment";
import { Page } from "../../pipeline/page";
import { UsageContext } from "../../pipeline/usageContext";

const templateTextRegex = /(?<!\\)\${(([^\\}]|\\}|\\)*)}/gm;

export class TemplateTextModule implements CompilerModule {
    compileFragment?(fragment: Fragment, usageContext: UsageContext): void {
        const dom: DocumentNode = fragment.dom;
        
        this.processTemplateText(fragment, null, usageContext, dom);
    }

    compilePage?(page: Page): void {
        const dom: DocumentNode = page.dom;
        
        this.processTemplateText(null, page, null, dom);
    }

    processTemplateText(fragment: Fragment | null, page: Page | null, usageContext: UsageContext | null, dom: DocumentNode): void {
        // find template text
        const templateTexts: TemplateText[] = this.findTemplateText(dom);

        // TODO execute
    }


    private findTemplateText(dom: DocumentNode): TemplateText[] {
        const templateTexts: TemplateText[] = [];

        // step through each node in the DOM to find text with template strings
        dom.walkDom((node: Node) => {
            if (TextNode.isTextNode(node)) {
                this.findTemplatesInText(node, templateTexts);
            } else if (TagNode.isTagNode(node)) {
                this.findTemplatesInTag(node, templateTexts);
            }
        });

        return templateTexts;
    }

    private findTemplatesInTag(node: TagNode, templateTexts: TemplateText[]): void {
        for (const attribute of node.attributes.entries()) {
            const name: string = attribute[0];
            const value: string | null = attribute[1];

            if (value != null && templateTextRegex.test(value)) {
                templateTexts.push(new AttributeTemplateText(node, name));
            }
        }
    }

    private findTemplatesInText(node: TextNode, templateTexts: TemplateText[]): void {
        if (templateTextRegex.test(node.text)) {
            templateTexts.push(new TextNodeTemplateText(node));
        }
    }
}

interface TemplateText {
    readonly node: Node;
}

class AttributeTemplateText implements TemplateText {
    readonly node: TagNode;
    readonly attribute: string;

    constructor(node: TagNode, attribute: string) {
        this.node = node;
        this.attribute = attribute;
    }

    static isAttribute(text: TemplateText): text is AttributeTemplateText {
        return TagNode.isTagNode(text.node);
    }
}

class TextNodeTemplateText implements TemplateText {
    readonly node: TextNode;

    constructor(node: TextNode) {
        this.node = node;
    }

    static isText(text: TemplateText): text is TextNodeTemplateText {
        return TextNode.isTextNode(text.node);
    }
}

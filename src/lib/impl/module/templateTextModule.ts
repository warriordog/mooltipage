import { CompilerModule, CompileData } from "../htmlCompiler";
import { Node, TagNode, TextNode, DocumentNode } from "../../dom/node";
import { Fragment } from "../../pipeline/fragment";
import { Page } from "../../pipeline/page";
import { UsageContext } from "../../pipeline/usageContext";
import { EvalEngine, EvalContext, EvalFunction } from "../../eval/evalEngine";
import { Pipeline } from "../../pipeline/pipeline";

const templateTextRegex = /\${(([^\\}]|\\}|\\)*)}/;

export class TemplateTextModule implements CompilerModule {
    private readonly evalEngine: EvalEngine;
    private readonly pipeline: Pipeline;

    constructor(pipeline: Pipeline) {
        this.pipeline = pipeline;
        this.evalEngine = new EvalEngine();
    }

    compileFragment(fragment: Fragment, compileData: CompileData, usageContext: UsageContext): void {
        this.processTemplateText(fragment, compileData, usageContext);
    }

    compilePage(page: Page, compileData: CompileData): void {
        this.processTemplateText(page, compileData);
    }

    processTemplateText(fragment: Fragment, compileData: CompileData, usageContext?: UsageContext): void {
        // find template text
        const templateTexts: TemplateText[] = this.findTemplateText(fragment.dom);

        // execute if there are any
        if (templateTexts.length > 0) {
            // create evalContext for templates
            const evalContext: EvalContext = {
                pipeline: this.pipeline,
                currentFragment: fragment,
                usageContext: usageContext,
                vars: compileData.vars
            }

            // parse functions
            const templateExecutors: TemplateTextExecutor[] = this.buildExecutors(templateTexts, evalContext);
    
            // execute templates and fill in text
            this.executeTemplateText(templateExecutors, evalContext);
        }
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
                templateTexts.push(new AttributeTemplateText(node, name, value));
            }
        }
    }

    private findTemplatesInText(node: TextNode, templateTexts: TemplateText[]): void {
        if (templateTextRegex.test(node.text)) {
            templateTexts.push(new TextNodeTemplateText(node));
        }
    }

    private buildExecutors(templateTexts: TemplateText[], evalContext: EvalContext): TemplateTextExecutor[] {
        return templateTexts.map((templateText: TemplateText) => {
            // create a callable function from the template string
            const evalFunc: EvalFunction<string> = this.evalEngine.parseTemplateString(templateText.template, evalContext.vars);

            return {
                evalFunction: evalFunc,
                templateText: templateText
            };
        });
    }
    
    private executeTemplateText(executors: TemplateTextExecutor[], evalContext: EvalContext): void {
        for (const executor of executors) {
            // execute function and generate new text
            const newText = this.evalEngine.executeFunction(executor.evalFunction, evalContext);

            // Check type of template text
            const template: TemplateText = executor.templateText;
            if (AttributeTemplateText.isAttribute(template)) {

                // write attribute of attribute node
                template.node.attributes.set(template.attribute, newText);
            } else if (TextNodeTemplateText.isText(template)) {

                // write content of text node
                template.node.text = newText;
            } else {
                throw new Error('Unkown template text type');
            }
        }
    }
}

interface TemplateText {
    readonly node: Node;
    readonly template: string;
}

class AttributeTemplateText implements TemplateText {
    readonly node: TagNode;
    readonly template: string;
    readonly attribute: string;

    constructor(node: TagNode, attribute: string, value: string) {
        this.node = node;
        this.attribute = attribute;
        this.template = value;
    }

    static isAttribute(text: TemplateText): text is AttributeTemplateText {
        return TagNode.isTagNode(text.node);
    }
}

class TextNodeTemplateText implements TemplateText {
    readonly node: TextNode;
    readonly template: string;

    constructor(node: TextNode) {
        this.node = node;
        this.template = node.text;
    }

    static isText(text: TemplateText): text is TextNodeTemplateText {
        return TextNode.isTextNode(text.node);
    }
}

interface TemplateTextExecutor {
    readonly templateText: TemplateText;
    readonly evalFunction: EvalFunction<string>;
}

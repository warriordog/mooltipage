import { Pipeline } from "./pipeline";
import { Fragment } from "./object/fragment";
import { DocumentNode, TagNode, TextNode, Node } from '../dom/node';
import { Parser, ParserOptions } from 'htmlparser2';
import { DomParser } from '../dom/domParser';
import { Page } from "./object/page";
import { Component, ComponentTemplate, ComponentScript, ComponentStyle, ComponentScriptType, ComponentScriptInstance, ComponentStyleBindType } from "./object/component";
import { EvalContent } from "./evalEngine";

export class HtmlParser {
    private readonly pipeline: Pipeline;

    constructor(pipeline: Pipeline) {
        this.pipeline = pipeline;
    }

    parseFragment(resId: string, html: string): Fragment {
        // parse HTML
        const dom: DocumentNode = this.parseDom(resId, html);

        // create fragment
        return new Fragment(resId, dom);
    }

    parsePage(resId: string, html: string): Page {
        // parse HTML
        const dom: DocumentNode = this.parseDom(resId, html);

        // create page
        return new Page(resId, dom);
    }

    parseComponent(resId: string, html: string): Component {
        // parse HTML
        const dom: DocumentNode = this.parseDom(resId, html);

        // parse <template>
        const componentTemplate: ComponentTemplate = this.parseComponentTemplate(resId, dom);

        // parse <script>
        const componentScript: ComponentScript = this.parseComponentScript(resId, dom);

        // parse <style>
        const componentStyle: ComponentStyle | undefined = this.parseComponentStyle(resId, dom);

        // create component
        return new Component(resId, componentTemplate, componentScript, componentStyle);
    }

    private parseComponentTemplate(resId: string, dom: DocumentNode): ComponentTemplate {
        // find template node
        const templateNode: TagNode | null = dom.findChildTag((node: TagNode) => node.tagName === 'template', false);

        // make sure it exists
        if (templateNode == null) {
            throw new Error(`Component '${resId}' is missing required section: <template>`);
        }

        // get template src
        const templateSrc: string | undefined = templateNode.attributes.get('src') ?? undefined;
        
        // get contents of template as dom
        const templateDom: DocumentNode = this.getDomForComponentSection(templateSrc, templateNode);

        // create component template
        return new ComponentTemplate(templateDom, templateSrc);
    }

    private parseComponentScript(resId: string, dom: DocumentNode): ComponentScript {
        // find script node
        const scriptNode: TagNode | null = dom.findChildTag((node: TagNode) => node.tagName === 'script', false);

        // make sure it exists
        if (scriptNode == null) {
            throw new Error(`Component '${resId}' is missing required section: <template>`);
        }

        // get script src
        const scriptSrc: string | undefined = scriptNode.attributes.get('src') ?? undefined;

        // get script type
        const scriptTypeName: string = scriptNode.attributes.get('type') ?? ComponentScriptType.CLASS;
        if (!Object.values(ComponentScriptType).includes(scriptTypeName as ComponentScriptType)) {
            throw new Error(`Unknown component <script> type: '${scriptTypeName}'`);
        }
        const scriptType: ComponentScriptType = scriptTypeName as ComponentScriptType;
        
        // get contents of script tag as dom
        const scriptDom: DocumentNode = this.getDomForComponentSection(scriptSrc, scriptNode);

        // get JS content
        const scriptText: Node | null = scriptDom.firstChild;
        if (scriptText == null) {
            throw new Error(`Component script section cannot be empty`);
        }
        if (!TextNode.isTextNode(scriptText)) {
            throw new Error(`Component <script> section can only contain text`);
        }

        // parse JS
        const scriptFunc: EvalContent<ComponentScriptInstance> = this.parseComponentScriptJs(scriptType, scriptText.text);

        // create component template
        return new ComponentScript(scriptType, scriptFunc, scriptSrc);
    }

    private parseComponentStyle(resId: string, dom: DocumentNode): ComponentStyle | undefined {
        // find style node
        const styleNode: TagNode | null = dom.findChildTag((node: TagNode) => node.tagName === 'style', false);

        // make sure it exists
        if (styleNode == null) {
            return undefined;
        }

        // get style src
        const styleSrc: string | undefined = styleNode.attributes.get('src') ?? undefined;

        // get style bind
        const styleBindName: string = styleNode.attributes.get('bind') ?? ComponentStyleBindType.HEAD;
        if (!Object.values(ComponentStyleBindType).includes(styleBindName as ComponentStyleBindType)) {
            throw new Error(`Unknown component <style> bind: '${styleBindName}'`);
        }
        const styleBind: ComponentStyleBindType = styleBindName as ComponentStyleBindType;
        
        // get contents of style tag as dom
        const styleDom: DocumentNode = this.getDomForComponentSection(styleSrc, styleNode);

        // get JS content
        const styleText: Node | null = styleDom.firstChild;
        if (styleText == null) {
            throw new Error(`Component <style> section cannot be empty`);
        }
        if (!TextNode.isTextNode(styleText)) {
            throw new Error(`Component <style> section can only contain text`);
        }

        // create component template
        return new ComponentStyle(styleText.text, styleBind, styleSrc);
    }

    private getDomForComponentSection(src: string | undefined, sectionNode: TagNode): DocumentNode {
        if (src != undefined) {
            throw new Error('External resoruce loading is not implmented');
        } else {
            return sectionNode.createDomFromChildren();
        }
    }

    private parseComponentScriptJs(scriptType: ComponentScriptType, text: string): EvalContent<Record<string, unknown>> {
        if (scriptType === ComponentScriptType.CLASS) {
            return this.pipeline.evalEngine.parseComponentClass(text);
        } else if (scriptType === ComponentScriptType.FUNCTION) {
            return this.pipeline.evalEngine.parseComponentFunction(text);
        } else {
            throw new Error(`Unsupported component <script> type: '${scriptType}'`);
        }
    }

    private parseDom(resId: string, html: string): DocumentNode {
        // set up handler
        const handler: DomParser = new DomParser();

        // create options
        const options: ParserOptions = {
            recognizeSelfClosing: true,
            lowerCaseTags: true
        };

        // create parser
        const parser: Parser = new Parser(handler, options);

        // process html
        parser.write(html);
        parser.end();

        // verify roots
        if (handler.dom == null) {
            throw new Error(`No dom was generated for resource ${resId}`);
        }

        return handler.dom;
    }
}
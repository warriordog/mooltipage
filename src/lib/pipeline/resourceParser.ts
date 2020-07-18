import { Fragment } from "./object/fragment";
import { DocumentNode, TagNode, TextNode } from '../dom/node';
import { DomParser } from '../dom/domParser';
import { Page } from "./object/page";
import { Component, ComponentTemplate, ComponentScript, ComponentStyle, ComponentScriptType, ComponentScriptInstance } from "./object/component";
import { EvalContent, EvalEngine } from "./evalEngine";
import { StyleBindType } from "./resourceBinder";
import { ResourceType } from "./pipelineInterface";
import { Pipeline } from "./pipeline";

export class ResourceParser {
    private readonly evalEngine: EvalEngine;
    private readonly pipeline: Pipeline;
    private readonly domParser: DomParser;

    constructor(pipeline: Pipeline) {
        this.pipeline = pipeline;
        this.evalEngine = new EvalEngine();
        this.domParser = new DomParser();
    }

    parseFragment(resPath: string, html: string): Fragment {
        // parse HTML
        const dom: DocumentNode = this.domParser.parseDom(html);

        // create fragment
        return new Fragment(resPath, dom);
    }

    parsePage(resPath: string, html: string): Page {
        // parse HTML
        const dom: DocumentNode = this.domParser.parseDom(html);

        // create page
        return new Page(resPath, dom);
    }

    parseComponent(resPath: string, html: string): Component {
        // parse HTML
        const dom: DocumentNode = this.domParser.parseDom(html);

        // parse <template>
        const componentTemplate: ComponentTemplate = this.parseComponentTemplate(resPath, dom);

        // parse <script>
        const componentScript: ComponentScript = this.parseComponentScript(resPath, dom);

        // parse <style>
        const componentStyle: ComponentStyle | undefined = this.parseComponentStyle(resPath, dom);

        // create component
        return new Component(resPath, componentTemplate, componentScript, componentStyle);
    }

    private parseComponentTemplate(resPath: string, dom: DocumentNode): ComponentTemplate {
        // find template node
        const templateNode = dom.findChildTagByTagName('template', false);

        // make sure it exists
        if (templateNode == null) {
            throw new Error(`Component '${resPath}' is missing required section: <template>`);
        }

        // get template src
        const templateSrc: string | undefined = templateNode.getOptionalValueAttribute('src');
        
        // get contents of template as dom
        const templateDom: DocumentNode = this.resolveDomSection(templateSrc, templateNode);

        // create component template
        return new ComponentTemplate(templateDom, templateSrc);
    }

    private parseComponentScript(resPath: string, dom: DocumentNode): ComponentScript {
        // find script node
        const scriptNode = dom.findChildTagByTagName('script', false);

        // make sure it exists
        if (scriptNode == null) {
            throw new Error(`Component '${resPath}' is missing required section: <template>`);
        }

        // get script src
        const scriptSrc: string | undefined = scriptNode.getOptionalValueAttribute('src');

        // get script type
        const scriptTypeName: string = scriptNode.getOptionalValueAttribute('mode') ?? ComponentScriptType.CLASS;
        if (!Object.values(ComponentScriptType).includes(scriptTypeName as ComponentScriptType)) {
            throw new Error(`Unknown component <script> mode: '${scriptTypeName}'`);
        }
        const scriptType: ComponentScriptType = scriptTypeName as ComponentScriptType;

        // get JS content
        const scriptText = this.resolveResourceSection(scriptSrc, scriptNode, ResourceType.JAVASCRIPT);

        // parse JS
        const scriptFunc: EvalContent<ComponentScriptInstance> = this.parseComponentScriptJs(scriptType, scriptText);

        // create component template
        return new ComponentScript(scriptType, scriptFunc, scriptSrc);
    }

    private parseComponentStyle(resPath: string, dom: DocumentNode): ComponentStyle | undefined {
        // find style node
        const styleNode = dom.findChildTagByTagName('style', false);

        // make sure it exists
        if (styleNode == null) {
            return undefined;
        }

        // get style src
        const styleSrc: string | undefined = styleNode.getOptionalValueAttribute('src');

        // get style bind
        const styleBindName: string = styleNode.getOptionalValueAttribute('bind') ?? StyleBindType.HEAD;
        if (!Object.values(StyleBindType).includes(styleBindName as StyleBindType)) {
            throw new Error(`Unknown component <style> bind: '${styleBindName}'`);
        }
        const styleBind: StyleBindType = styleBindName as StyleBindType;

        // get style content
        const styleText = this.resolveResourceSection(styleSrc, styleNode, ResourceType.CSS);

        // create component template
        return new ComponentStyle(styleText, styleBind, styleSrc);
    }

    private resolveResourceSection(src: string | undefined, sectionNode: TagNode, resourceType: ResourceType): string {
        if (src != undefined) {
            // get ID of external resource
            const resPath = sectionNode.getRequiredValueAttribute('src');

            // load resource
            return this.pipeline.getRawResource(resourceType, resPath);
        } else {
            const textNode = sectionNode.firstChild;
            if (textNode == null) {
                throw new Error(`Component section cannot be empty`);
            }
            if (!TextNode.isTextNode(textNode)) {
                throw new Error(`Component section can only contain text`);
            }
            return textNode.text;
        }
    }

    private resolveDomSection(src: string | undefined, sectionNode: TagNode): DocumentNode {
        if (src != undefined) {
            // get ID of external resource
            const resPath = sectionNode.getRequiredValueAttribute('src');

            // load resource
            const fragment = this.pipeline.getRawFragment(resPath);

            return fragment.dom;
        } else {
            return sectionNode.createDomFromChildren();
        }
    }

    private parseComponentScriptJs(scriptType: ComponentScriptType, text: string): EvalContent<Record<string, unknown>> {
        if (scriptType === ComponentScriptType.CLASS) {
            return this.evalEngine.parseComponentClass(text);
        } else if (scriptType === ComponentScriptType.FUNCTION) {
            return this.evalEngine.parseComponentFunction(text);
        } else {
            throw new Error(`Unsupported component <script> type: '${scriptType}'`);
        }
    }
}
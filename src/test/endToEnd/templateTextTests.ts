import { TestSet, TestCallback } from '../framework/testSet';
import * as Assert from '../framework/assert';
import { MemoryPipelineInterface } from '../mocks/memoryPipelineInterface';
import { Fragment } from '../../lib/pipeline/fragment';
import { UsageContext } from '../../lib/pipeline/usageContext';
import { DocumentNode, TagNode, TextNode, Node } from '../../lib/dom/node';
import { Pipeline } from '../../lib/pipeline/pipeline';

export class TemplateTextTests implements TestSet {

    // test methods

    private testBasicFragment(): void {
        // compile fragment
        const fragment: Fragment = this.getPipeline().compileFragment('fragment.html', new UsageContext(false));
        const dom: DocumentNode = fragment.dom;

        // test
        this.validateBasic(dom);
    }

    private testBasicPage(): void {
        // compile page
        const page: Fragment = this.getPipeline().compilePage('page.html');
        const dom: DocumentNode = page.dom;

        // test
        this.validateBasic(dom);
    }

    private testParamsFragment(): void {
        // compile fragment
        const fragment: Fragment = this.getPipeline().compileFragment('paramsFragment.html', new UsageContext(false));
        const dom: DocumentNode = fragment.dom;

        // test
        this.validateParams(dom);
    }

    private testParamsPage(): void {
        // compile page
        const page: Fragment = this.getPipeline().compilePage('paramsPage.html');
        const dom: DocumentNode = page.dom;

        // test
        this.validateParams(dom);
    }

    private testSlot(): void {
        // compile fragment
        const fragment: Fragment = this.getPipeline().compileFragment('slot.html', new UsageContext(false));
        const dom: DocumentNode = fragment.dom;

        // test
        const template = dom.findChildTag((node: TagNode) => node.attributes.get('id') === 'template');
        const templateText = template?.firstChild;
        
        Assert.IsNotNullish(template);
        Assert.IsNotNullish(templateText);
        Assert.IsTrue(TextNode.isTextNode(templateText as Node));
        Assert.AreEqual((templateText as TextNode).text, 'slot.html');
    }

    private testAttributes(): void {
        // compile fragment
        const fragment: Fragment = this.getPipeline().compileFragment('attributes.html', new UsageContext(false));
        const dom: DocumentNode = fragment.dom;

        // test
        const div1 = dom.findChildTag((node: TagNode) => node.attributes.get('id') === 'div1');
        const div2 = dom.findChildTag((node: TagNode) => node.attributes.get('id') === 'div2');
        const div3 = dom.findChildTag((node: TagNode) => node.attributes.get('id') === 'div3');

        Assert.AreEqual(div1?.attributes.get('value'), 'value1');
        Assert.AreEqual(div2?.attributes.get('value'), 'value2');
        Assert.AreEqual(div3?.attributes.get('value'), 'value3');
    }

    private testAttributesMulti(): void {
        // compile fragment
        const fragment: Fragment = this.getPipeline().compileFragment('attributesMulti.html', new UsageContext(false));
        const dom: DocumentNode = fragment.dom;

        // test
        const div = dom.findChildTag((node: TagNode) => node.tagName === 'div');

        Assert.AreEqual(div?.attributes.get('a1'), 'value1');
        Assert.AreEqual(div?.attributes.get('a2'), 'value2');
        Assert.AreEqual(div?.attributes.get('a3'), 'value3');
    }

    private testEscape(): void {
        // compile fragment
        const fragment: Fragment = this.getPipeline().compileFragment('escape.html', new UsageContext(false));
        const dom: DocumentNode = fragment.dom;

        // test
        const div = dom.findChildTag((node: TagNode) => node.tagName === 'div');

        Assert.AreEqual(div?.attributes.get('value'), '${ \'escaped\' }');
    }

    private testEscapeMixed(): void {
        // compile fragment
        const fragment: Fragment = this.getPipeline().compileFragment('escapeMixed.html', new UsageContext(false));

        // test
        const div = fragment.dom.findChildTag((node: TagNode) => node.tagName === 'div');

        Assert.AreEqual(div?.attributes.get('value'), '${ \'escaped\' }not escaped');
    }

    // shared test code

    private validateBasic(dom: DocumentNode): void {
        // get counts
        const div = dom.findChildTag((node: TagNode) => node.tagName === 'div');
        const text = div?.firstChild;

        // check content
        Assert.IsNotNullish(div);
        Assert.IsNotNullish(text);
        Assert.IsTrue(TextNode.isTextNode(text as Node));
        Assert.AreEqual((text as TextNode).text, 'div content');
    }

    private validateParams(dom: DocumentNode): void {
        // get counts
        const pipelineDiv = dom.findChildTag((node: TagNode) => node.attributes.get('id') === 'pipeline');
        const pipelineText = pipelineDiv?.firstChild;
        const fragmentDiv = dom.findChildTag((node: TagNode) => node.attributes.get('id') === 'fragment');
        const fragmentText = fragmentDiv?.firstChild;
        const usageContextDiv = dom.findChildTag((node: TagNode) => node.attributes.get('id') === 'usageContext');
        const usageContextText = usageContextDiv?.firstChild;

        // check content
        Assert.IsNotNullish(pipelineDiv);
        Assert.IsNotNullish(pipelineText);
        Assert.IsNotNullish(fragmentDiv);
        Assert.IsNotNullish(fragmentText);
        Assert.IsNotNullish(usageContextDiv);
        Assert.IsNotNullish(usageContextText);
        Assert.IsTrue(TextNode.isTextNode(pipelineText as Node));
        Assert.IsTrue(TextNode.isTextNode(fragmentText as Node));
        Assert.IsTrue(TextNode.isTextNode(usageContextText as Node));
        Assert.AreEqual((pipelineText as TextNode).text, 'true');
        Assert.AreEqual((fragmentText as TextNode).text, 'true');
        Assert.AreEqual((usageContextText as TextNode).text, 'true');
    }

    // test data
    private getPipeline(): Pipeline {
        if (this.pipeline == undefined) throw new Error('Pipeline is undefined');
        return this.pipeline;
    }

    // test set boilerplate

    readonly setName: string = 'TemplateTextTests';

    getTests(): Map<string, TestCallback> {
        return new Map<string, TestCallback>([
            ['BasicFragment', (): void => this.testBasicFragment()],
            ['BasicPage', (): void => this.testBasicPage()],
            ['ParamsFragment', (): void => this.testParamsFragment()],
            ['ParamsPage', (): void => this.testParamsPage()],
            ['Slot', (): void => this.testSlot()],
            ['Attributes', (): void => this.testAttributes()],
            ['AttributesMulti', (): void => this.testAttributesMulti()],
            ['Escape', (): void => this.testEscape()],
            ['EscapeMixed', (): void => this.testEscapeMixed()]
        ]);
    }

    // Test setup

    private pipeline?: Pipeline;

    beforeTest(): void {
        const pipelineInterface = new MemoryPipelineInterface();
        this.pipeline = new Pipeline(pipelineInterface);

        pipelineInterface.htmlSource.set('page.html', `
            <!DOCTYPE HTML>
            <html>
                <head>
                    <title>Template Text Tests</title>
                </head>
                <body>
                    <div>\${ 'div content' }</div>
                </body>
            </html>
        `);

        pipelineInterface.htmlSource.set('fragment.html', `
            <div>\${ 'div content' }</div>
        `);

        pipelineInterface.htmlSource.set('paramsPage.html', `
            <!DOCTYPE HTML>
            <html>
                <head>
                    <title>Template Text Tests</title>
                </head>
                <body>
                    <div id="pipeline">\${ $.pipeline != null }</div>
                    <div id="fragment">\${ $.currentFragment != null }</div>
                    <div id="usageContext">\${ $.usageContext != null }</div>
                </body>
            </html>
        `);

        pipelineInterface.htmlSource.set('paramsFragment.html', `
            <div id="pipeline">\${ $.pipeline != null }</div>
            <div id="fragment">\${ $.currentFragment != null }</div>
            <div id="usageContext">\${ $.usageContext != null }</div>
        `);

        pipelineInterface.htmlSource.set('slot.html', `
            <div id="outer">
                <m-fragment src="slot2.html">
                    <div id="template">\${ $.currentFragment.resId }</div>
                </m-fragment>
            </div>
        `);

        pipelineInterface.htmlSource.set('slot2.html', `
            <div id="inner">
                <m-slot></m-slot>
            </div>
        `);

        pipelineInterface.htmlSource.set('attributes.html', `
            <div id="div1" value="\${ 'value1' }"></div>
            <div id="div2" value="\${ 'value2' }"></div>
            <div id="div3" value="\${ 'value3' }"></div>
        `);

        pipelineInterface.htmlSource.set('attributesMulti.html', `
            <div id="div1" a1="\${ 'value1' }" a2="\${ 'value2' }" a3="\${ 'value3' }"></div>
        `);

        pipelineInterface.htmlSource.set('escape.html', `
            <div value="\\\${ 'escaped' }"></div>
        `);

        pipelineInterface.htmlSource.set('escapeMixed.html', `
            <div value="\\\${ 'escaped' }\${ 'not escaped' }"></div>
        `);
    }
}
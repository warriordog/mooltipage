import { TestSet, TestCallback } from '../framework/testSet';
import * as Assert from '../framework/assert';
import { MemoryPipelineInterface } from '../mocks/memoryPipelineInterface';
import { Fragment } from '../../lib/pipeline/object/fragment';
import { UsageContext } from '../../lib/pipeline/usageContext';
import { DocumentNode, TagNode, TextNode, Node } from '../../lib/dom/node';
import { Pipeline } from '../../lib/pipeline/pipeline';
import { Page } from '../../lib/pipeline/object/page';

export class TemplateTextTests implements TestSet {

    // test methods

    private testBasicFragment(): void {
        // compile fragment
        const fragment: Fragment = this.getPipeline().compileFragment('fragment.html', new UsageContext(new Page('123', new DocumentNode())));
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
        const fragment: Fragment = this.getPipeline().compileFragment('paramsFragment.html', new UsageContext(new Page('123', new DocumentNode())));
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
        const fragment: Fragment = this.getPipeline().compileFragment('slot.html', new UsageContext(new Page('123', new DocumentNode())));
        const dom: DocumentNode = fragment.dom;

        // test
        const template = dom.findChildTag((node: TagNode) => node.getAttribute('id') === 'template');
        const templateText = template?.firstChild;
        const templateTextText = (templateText as TextNode).text;
        
        Assert.IsNotNullish(template);
        Assert.IsNotNullish(templateText);
        Assert.IsTrue(TextNode.isTextNode(templateText as Node));
        Assert.AreEqual('slot.html', templateTextText);
    }

    private testAttributes(): void {
        // compile fragment
        const fragment: Fragment = this.getPipeline().compileFragment('attributes.html', new UsageContext(new Page('123', new DocumentNode())));
        const dom: DocumentNode = fragment.dom;

        // test
        const div1 = dom.findChildTag((node: TagNode) => node.getAttribute('id') === 'div1');
        const div1Value = div1?.getAttribute('value');
        const div2 = dom.findChildTag((node: TagNode) => node.getAttribute('id') === 'div2');
        const div2Value = div2?.getAttribute('value');
        const div3 = dom.findChildTag((node: TagNode) => node.getAttribute('id') === 'div3');
        const div3Value = div3?.getAttribute('value');

        Assert.AreEqual('value1', div1Value);
        Assert.AreEqual('value2', div2Value);
        Assert.AreEqual('value3', div3Value);
    }

    private testAttributesMulti(): void {
        // compile fragment
        const fragment: Fragment = this.getPipeline().compileFragment('attributesMulti.html', new UsageContext(new Page('123', new DocumentNode())));
        const dom: DocumentNode = fragment.dom;

        // test
        const div = dom.findChildTag((node: TagNode) => node.tagName === 'div');
        const divValue1 = div?.getAttribute('a1');
        const divValue2 = div?.getAttribute('a2');
        const divValue3 = div?.getAttribute('a3');

        Assert.AreEqual('value1', divValue1);
        Assert.AreEqual('value2', divValue2);
        Assert.AreEqual('value3', divValue3);
    }

    private testEscape(): void {
        // compile fragment
        const fragment: Fragment = this.getPipeline().compileFragment('escape.html', new UsageContext(new Page('123', new DocumentNode())));
        const dom: DocumentNode = fragment.dom;

        // test
        const div = dom.findChildTag((node: TagNode) => node.tagName === 'div');
        const divValue = div?.getAttribute('value');

        Assert.AreEqual('${ \'escaped\' }', divValue);
    }

    private testEscapeMixed(): void {
        // compile fragment
        const fragment: Fragment = this.getPipeline().compileFragment('escapeMixed.html', new UsageContext(new Page('123', new DocumentNode())));

        // test
        const div = fragment.dom.findChildTag((node: TagNode) => node.tagName === 'div');
        const divValue = div?.getAttribute('value');

        Assert.AreEqual('${ \'escaped\' }not escaped', divValue);
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
        Assert.AreEqual('div content', (text as TextNode).text);
    }

    private validateParams(dom: DocumentNode): void {
        // get counts
        const pipelineDiv = dom.findChildTag((node: TagNode) => node.getAttribute('id') === 'pipeline');
        const pipelineText = pipelineDiv?.firstChild;
        const fragmentDiv = dom.findChildTag((node: TagNode) => node.getAttribute('id') === 'fragment');
        const fragmentText = fragmentDiv?.firstChild;
        const usageContextDiv = dom.findChildTag((node: TagNode) => node.getAttribute('id') === 'usageContext');
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
        Assert.AreEqual('true', (pipelineText as TextNode).text);
        Assert.AreEqual('true', (fragmentText as TextNode).text);
        Assert.AreEqual('true', (usageContextText as TextNode).text);
    }

    // test data
    private getPipeline(): Pipeline {
        if (this.pipeline == undefined) throw new Error('Pipeline is undefined');
        return this.pipeline;
    }

    // test set boilerplate

    readonly setName: string = 'TemplateText';

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
                    <div id="pipeline">\${ $$.pipeline != null }</div>
                    <div id="fragment">\${ $$.currentFragment != null }</div>
                    <div id="usageContext">\${ $$.usageContext != null }</div>
                </body>
            </html>
        `);

        pipelineInterface.htmlSource.set('paramsFragment.html', `
            <div id="pipeline">\${ $$.pipeline != null }</div>
            <div id="fragment">\${ $$.currentFragment != null }</div>
            <div id="usageContext">\${ $$.usageContext != null }</div>
        `);

        pipelineInterface.htmlSource.set('slot.html', `
            <div id="outer">
                <m-fragment src="slot2.html">
                    <div id="template">\${ $$.currentFragment.resId }</div>
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
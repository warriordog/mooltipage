import { TestSet, TestCallback } from '../framework/testSet';
import * as Assert from '../framework/assert';
import { MemoryPipelineInterface } from '../mocks/memoryPipelineInterface';
import { TagNode, TextNode } from '../../lib/dom/node';
import { Pipeline } from '../../lib/pipeline/pipeline';
import { Page } from '../../lib/pipeline/object/page';

export class ComponentTests implements TestSet {

    // test methods

    private testBasicComponents(): void {
        // compile page
        const page: Page = this.getPipeline().compilePage('page.html');
        const head = page.head;
        const body = page.body;

        // validate page content
        const styles = head.findChildTags((tag: TagNode) => tag.tagName === 'style');
        const comp1s = body.findChildTags((tag: TagNode) => tag.tagName === 'div' && tag.attributes.get('class') === 'comp1');
        const comp2s = body.findChildTags((tag: TagNode) => tag.tagName === 'div' && tag.attributes.get('class') === 'comp2');
        const comp3s = body.findChildTags((tag: TagNode) => tag.tagName === 'div' && tag.attributes.get('class') === 'comp3');
        const comp1div1s = body.findChildTags((tag: TagNode) => tag.tagName === 'div' && tag.attributes.get('class') === 'comp1div1');
        const comp1div2s = body.findChildTags((tag: TagNode) => tag.tagName === 'div' && tag.attributes.get('class') === 'comp1div2');
        const comp1div3s = body.findChildTags((tag: TagNode) => tag.tagName === 'div' && tag.attributes.get('class') === 'comp1div3');
        const comp1div3text = comp1div3s.find((tag: TagNode) => tag.firstChild != null && TextNode.isTextNode(tag.firstChild))?.firstChild as TextNode | undefined;
        const comp3text = comp3s.find((tag: TagNode) => tag.firstChild != null && TextNode.isTextNode(tag.firstChild))?.firstChild as TextNode | undefined;

        Assert.AreEqual(2, styles.length);
        Assert.IsTrue(styles.some((node: TagNode) => node.firstChild != null && TextNode.isTextNode(node.firstChild) && node.firstChild.text.includes('.comp2 {}')));
        Assert.IsTrue(styles.some((node: TagNode) => node.firstChild != null && TextNode.isTextNode(node.firstChild) && node.firstChild.text.includes('.comp3 {}')));

        Assert.AreEqual(1, comp1s.length);
        Assert.AreEqual(1, comp2s.length);
        Assert.AreEqual(1, comp3s.length);
        Assert.AreEqual(1, comp1div1s.length);
        Assert.AreEqual(1, comp1div2s.length);
        Assert.AreEqual(1, comp1div3s.length);
        Assert.IsNotNullish(comp1div3text);
        Assert.AreEqual('TestMessage', comp1div3text?.text);
        Assert.IsNotNullish(comp3text);
        Assert.AreEqual('comp3message', comp3text?.text);
    }

    // test data
    private getPipeline(): Pipeline {
        if (this.pipeline == undefined) throw new Error('Pipeline is undefined');
        return this.pipeline;
    }

    // test set boilerplate

    readonly setName: string = 'Component';

    getTests(): Map<string, TestCallback> {
        return new Map<string, TestCallback>([
            ['BasicComponents', (): void => this.testBasicComponents()]
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
                    <title>Component Tests</title>
                </head>
                <body>
                    <m-component src="comp1.html" />
                </body>
            </html>
        `);

        pipelineInterface.htmlSource.set('comp1.html', `
            <template>
                <div class="comp1">
                    <div class="comp1div1">Component 1 Div 1</div>
                    <m-component src="comp2.html">
                        <div class="comp1div2">Component 1 Div 2</div>
                    </m-component>
                    <m-component src="comp3.html" message="comp3message" />
                    <div class="comp1div3">\${ $.testMessage }</div>
                </div>
            </template>

            <script type="class">
                return class Component1 {
                    constructor(scope, context) {
                        this.testMessage = 'TestMessage';
                    }
                }
            </script>
        `);

        pipelineInterface.htmlSource.set('comp2.html', `
            <template>
                <div class="comp2">
                    <m-slot />
                </div>
            </template>

            <script type="class">
                return class Component2 {
                    constructor(scope, context) {}
                }
            </script>

            <style bind="head">
                .comp2 {}
            </style>
        `);

        pipelineInterface.htmlSource.set('comp3.html', `
            <template>
                <div class="comp3">\${ $.messageText }</div>
            </template>

            <script>
                return class Component3 {
                    constructor(scope, context) {
                        this.messageText = scope.message != null ? scope.message : 'No message specified.';
                    }
                }
            </script>

            <style bind="head">
                .comp3 {}
            </style>
        `);
    }
}
import { TestSet, TestCallback } from '../framework/testSet';
import * as Assert from '../framework/assert';
import { MemoryPipelineInterface } from '../mocks/memoryPipelineInterface';
import { Fragment } from '../../lib/pipeline/object/fragment';
import { UsageContext } from '../../lib/pipeline/usageContext';
import { DocumentNode, TagNode } from '../../lib/dom/node';
import { Pipeline } from '../../lib/pipeline/pipeline';

export class FragmentOnlyTests implements TestSet {

    // test methods

    private testAsFragment(): void {
        // compile fragment
        const fragment: Fragment = this.getPipeline().compileFragment('test1.html', new UsageContext(false));
        const dom: DocumentNode = fragment.dom;

        // test
        this.validateContent(dom);
    }

    private testAsPage(): void {
        // compile page
        const page: Fragment = this.getPipeline().compilePage('page.html');
        const dom: DocumentNode = page.dom;

        // test
        this.validateContent(dom);
    }

    private testFragmentRoot(): void {
        // compile fragment
        const fragment: Fragment = this.getPipeline().compileFragment('root1.html', new UsageContext(false));
        const dom: DocumentNode = fragment.dom;

        // test
        const divs = dom.findChildTags((node: TagNode) => node.tagName === 'div', true);
        const mFragments = dom.findChildTags((node: TagNode) => node.tagName === 'm-fragment', true);

        Assert.AreEqual(divs.length, 1);
        Assert.IsEmpty(mFragments);
    }

    // shared test code

    private validateContent(dom: DocumentNode): void {
        // get counts
        const test1divs = dom.findChildTags((node: TagNode) => node.attributes.get('class') === 'test1div', true);
        const test2divs = dom.findChildTags((node: TagNode) => node.attributes.get('class') === 'test2div', true);
        const test3div1s = dom.findChildTags((node: TagNode) => node.attributes.get('class') === 'test3div1', true);
        const test3div2s = dom.findChildTags((node: TagNode) => node.attributes.get('class') === 'test3div2', true);
        const test4divs = dom.findChildTags((node: TagNode) => node.attributes.get('class') === 'test4div', true);
        const test5divs = dom.findChildTags((node: TagNode) => node.attributes.get('class') === 'test5div', true);
        const spans = dom.findChildTags((node: TagNode) => node.tagName === 'span', true);
        const mFragments = dom.findChildTags((node: TagNode) => node.tagName === 'm-fragment', true);

        // check counts
        Assert.IsEmpty(mFragments);
        Assert.AreEqual(test1divs.length, 1);
        Assert.AreEqual(test2divs.length, 2);
        Assert.AreEqual(test3div1s.length, 4);
        Assert.AreEqual(test3div2s.length, 4);
        Assert.AreEqual(test4divs.length, 6);
        Assert.AreEqual(test5divs.length, 4);
        Assert.AreEqual(spans.length, 10);
    }

    // test data
    private getPipeline(): Pipeline {
        if (this.pipeline == undefined) throw new Error('Pipeline is undefined');
        return this.pipeline;
    }

    // test set boilerplate

    readonly setName: string = 'FragmentOnlyTests';

    getTests(): Map<string, TestCallback> {
        return new Map<string, TestCallback>([
            ['AsFragment', (): void => this.testAsFragment()],
            ['AsPage', (): void => this.testAsPage()],
            ['FragmentRoot', (): void => this.testFragmentRoot()]
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
                    <title>Fragment Only Tests</title>
                </head>
                <body>
                    <m-fragment src="test1.html"></m-fragment>
                </body>
            </html>
        `);

        pipelineInterface.htmlSource.set('test1.html', `
            <div class="test1div">
                <m-fragment src="test2.html"></m-fragment>
                <m-fragment src="test2.html"></m-fragment>
            </div>
        `);

        pipelineInterface.htmlSource.set('test2.html', `
            <div class="test2div">
                <m-fragment src="test3.html"></m-fragment>
                <m-fragment src="test4.html"></m-fragment>
                <m-fragment src="test3.html"></m-fragment>
            </div>
        `);
        
        pipelineInterface.htmlSource.set('test3.html', `
            <div class="test3div1">
                <m-fragment src="test4.html"></m-fragment>
            </div>
            <div class="test3div2">
                <m-fragment src="test5.html"></m-fragment>
            </div>
        `);
        
        pipelineInterface.htmlSource.set('test4.html', `
            <div class="test4div">
                <span>Test 4</span>
            </div>
        `);
        
        pipelineInterface.htmlSource.set('test5.html', `
            <div class="test5div">
                <span>Test 5</span>
            </div>
        `);

        pipelineInterface.htmlSource.set('root1.html', `
            <m-fragment src="root2.html"></m-fragment>
        `);

        pipelineInterface.htmlSource.set('root2.html', `
            <m-fragment src="root3.html"></m-fragment>
        `);

        pipelineInterface.htmlSource.set('root3.html', `
            <div>Root 3</div>
        `);
    }
}
import { TestSet, TestCallback } from '../framework/testSet';
import * as Assert from '../framework/assert';
import { MemoryPipelineInterface } from '../mocks/memoryPipelineInterface';
import { Fragment } from '../../lib/pipeline/fragment';
import { UsageContext } from '../../lib/pipeline/usageContext';
import { DocumentNode, TagNode } from '../../lib/dom/node';
import { Page } from '../../lib/pipeline/page';
import { Pipeline } from '../../lib/pipeline/pipeline';
import { PipelineImpl } from '../../lib/impl/pipelineImpl';

export class FragmentSlotTests implements TestSet {

    // test methods

    private testAsFragment(): void {
        // compile fragment
        const fragment: Fragment = this.getPipeline().compileFragment('test1.html', new UsageContext());
        const dom = fragment.dom;

        // test
        this.validateContent(dom);
    }

    private testAsPage(): void {
        // compile page
        const page: Page = this.getPipeline().compilePage('page.html');
        const dom: DocumentNode = page.dom;

        // test
        this.validateContent(dom);
    }

    private testFragmentRoot(): void {
        // compile fragment
        const fragment: Fragment = this.getPipeline().compileFragment('root1.html', new UsageContext());
        const dom = fragment.dom;

        // test
        const divs = dom.findChildTags((node: TagNode) => node.tagName === 'div', true);
        const mFragments = dom.findChildTags((node: TagNode) => node.tagName === 'm-fragment', true);
        const mContents = dom.findChildTags((node: TagNode) => node.tagName === 'm-content', true);
        const mSlots = dom.findChildTags((node: TagNode) => node.tagName === 'm-slot', true);

        Assert.AreEqual(divs.length, 1);
        Assert.IsEmpty(mFragments);
        Assert.IsEmpty(mContents);
        Assert.IsEmpty(mSlots);
    }

    private testFragmentInSlot(): void {
        // compile fragment
        const fragment: Fragment = this.getPipeline().compileFragment('nested1.html', new UsageContext());
        const dom = fragment.dom;

        // test
        const divs = dom.findChildTags((node: TagNode) => node.tagName === 'div');
        const h1s = dom.findChildTags((node: TagNode) => node.tagName === 'h1');
        const mFragments = dom.findChildTags((node: TagNode) => node.tagName === 'm-fragment');
        const mContents = dom.findChildTags((node: TagNode) => node.tagName === 'm-content');
        const mSlots = dom.findChildTags((node: TagNode) => node.tagName === 'm-slot');
        const nested1s = dom.findChildTags((node: TagNode) => node.attributes.get('class') === 'nested1');
        const nested2s = dom.findChildTags((node: TagNode) => node.attributes.get('class') === 'nested2');
        const nested3s = dom.findChildTags((node: TagNode) => node.attributes.get('class') === 'nested3');
        const innerh1s = dom.findChildTagsByPath([
            (node: TagNode) => node.tagName === 'div' && node.attributes.get('class') === 'nested1',
            (node: TagNode) => node.tagName === 'div' && node.attributes.get('class') === 'nested2',
            (node: TagNode) => node.tagName === 'div' && node.attributes.get('class') === 'nested3',
            (node: TagNode) => node.tagName === 'h1'
        ]);

        Assert.IsEmpty(mFragments);
        Assert.IsEmpty(mContents);
        Assert.IsEmpty(mSlots);
        Assert.AreEqual(divs.length, 3);
        Assert.AreEqual(h1s.length, 1);
        Assert.AreEqual(nested1s.length, 1);
        Assert.AreEqual(nested2s.length, 1);
        Assert.AreEqual(nested3s.length, 1);
        Assert.AreEqual(innerh1s.length, 1);
    }

    // shared test code

    private validateContent(dom: DocumentNode): void {
        // get counts
        const test1divs = dom.findChildTags((node: TagNode) => node.attributes.get('class') === 'test1div', true);
        const test2divs = dom.findChildTags((node: TagNode) => node.attributes.get('class') === 'test2div', true);
        const test3divs = dom.findChildTags((node: TagNode) => node.attributes.get('class') === 'test3div', true);
        const test1slot1s = dom.findChildTags((node: TagNode) => node.attributes.get('class') === 'test1slot1', true);
        const test1slot2s = dom.findChildTags((node: TagNode) => node.attributes.get('class') === 'test1slot2', true);
        const test1slotDs = dom.findChildTags((node: TagNode) => node.attributes.get('class') === 'test1slotD', true);
        const divs = dom.findChildTags((node: TagNode) => node.tagName === 'div', true);
        const mFragments = dom.findChildTags((node: TagNode) => node.tagName === 'm-fragment', true);
        const mContents1 = dom.findChildTags((node: TagNode) => node.tagName === 'm-content', true);
        const mContents2 = dom.findChildTags((node: TagNode) => node.attributes.get('m-content') != null, true);
        const mSlots1 = dom.findChildTags((node: TagNode) => node.tagName === 'm-slot', true);
        const mSlots2 = dom.findChildTags((node: TagNode) => node.attributes.get('m-slot') != null, true);

        // verify counts
        Assert.IsEmpty(mFragments);
        Assert.IsEmpty(mContents1);
        Assert.IsEmpty(mContents2);
        Assert.IsEmpty(mSlots1);
        Assert.IsEmpty(mSlots2);
        Assert.AreEqual(test1divs.length, 1);
        Assert.AreEqual(test2divs.length, 1);
        Assert.AreEqual(test3divs.length, 1);
        Assert.AreEqual(test1slot1s.length, 1);
        Assert.AreEqual(test1slot2s.length, 1);
        Assert.AreEqual(test1slotDs.length, 1);
        Assert.AreEqual(divs.length, 7);
    }

    // test data
    private getPipeline(): Pipeline {
        if (this.pipeline == undefined) throw new Error('Pipeline is undefined');
        return this.pipeline;
    }

    // test set boilerplate

    readonly setName: string = 'FragmentSlotTests';

    getTests(): Map<string, TestCallback> {
        return new Map<string, TestCallback>([
            ['AsFragment', (): void => this.testAsFragment()],
            ['AsPage', (): void => this.testAsPage()],
            ['FragmentRoot', (): void => this.testFragmentRoot()],
            ['FragmentInSlot', (): void => this.testFragmentInSlot()]
        ]);
    }

    // Test setup
    
    private pipeline?: Pipeline;

    beforeTest(): void {
        const pipelineInterface = new MemoryPipelineInterface();
        this.pipeline = new PipelineImpl(pipelineInterface, pipelineInterface);

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
                <m-fragment src="test2.html">
                    <m-content slot="slot1">
                        <div class="test1slot1"></div>
                    </m-content>
                    <m-content slot="slot2">
                        <div class="test1slot2"></div>
                    </m-content>
                    <div class="test1slotD"></div>
                </m-fragment>
            </div>
        `);

        pipelineInterface.htmlSource.set('test2.html', `
            <div class="test2div">
                <m-fragment src="test3.html">
                    <m-slot name="slot1"></m-slot>
                    <div m-slot="slot2"></div>
                    <m-slot></m-slot>
                </m-fragment>
            </div>
        `);
        
        pipelineInterface.htmlSource.set('test3.html', `
            <div class="test3div">
                <m-slot></m-slot>
            </div>
        `);

        pipelineInterface.htmlSource.set('root1.html', `
            <m-fragment src="root2.html">
                <div>Slot Content</div>
            </m-fragment>
        `);

        pipelineInterface.htmlSource.set('root2.html', `
            <m-fragment src="root3.html">
                <m-slot></m-slot>
            </m-fragment>
        `);

        pipelineInterface.htmlSource.set('root3.html', `
            <m-slot></m-slot>
        `);

        pipelineInterface.htmlSource.set('nested1.html', `
            <div class="nested1">
                <m-fragment src="nested2.html">
                    <m-content slot="slot1">
                        <m-fragment src="nested3.html"></m-fragment>
                    </m-content>
                </m-fragment>
            </div>
        `);

        pipelineInterface.htmlSource.set('nested2.html', `
            <div class="nested2">
                <m-slot name="slot1"></m-slot>
            </div>
        `);

        pipelineInterface.htmlSource.set('nested3.html', `
            <div class="nested3">
                <h1>Nested 3 content</h1>
            </div>
        `);
    }
}
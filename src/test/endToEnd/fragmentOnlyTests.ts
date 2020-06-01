import { TestSet, TestCallback } from '../framework/testSet';
import * as Assert from '../framework/assert';
import MemoryPipelineInterface from '../mocks/memoryPipelineInterface';
import { Fragment } from '../../lib/pipeline/fragment';
import { UsageContext } from '../../lib/pipeline/usageContext';
import * as DomUtils from 'domutils';
import { Element } from 'domhandler';
import { Dom } from '../../lib/pipeline/dom';
import { Page } from '../../lib/pipeline/page';
import { Pipeline } from '../../lib/pipeline/pipeline';
import { PipelineImpl } from '../../lib/impl/pipelineImpl';

export default class FragmentOnlyTests implements TestSet {

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
        const dom: Dom = page.dom;

        // test
        this.validateContent(dom);
    }

    // shared test code

    private validateContent(dom: Dom): void {
        // get counts
        const test1divs = DomUtils.findAll((elem: Element) => elem.attribs['class'] === 'test1div', dom);
        const test2divs = DomUtils.findAll((elem: Element) => elem.attribs['class'] === 'test2div', dom);
        const test3div1s = DomUtils.findAll((elem: Element) => elem.attribs['class'] === 'test3div1', dom);
        const test3div2s = DomUtils.findAll((elem: Element) => elem.attribs['class'] === 'test3div2', dom);
        const test4divs = DomUtils.findAll((elem: Element) => elem.attribs['class'] === 'test4div', dom);
        const test5divs = DomUtils.findAll((elem: Element) => elem.attribs['class'] === 'test5div', dom);
        const spans = DomUtils.findAll((elem: Element) => elem.tagName.toLowerCase() === 'span', dom);
        const mFragments = DomUtils.findAll((elem: Element) => elem.tagName.toLowerCase() === 'm-fragment', dom);
        const mContents1 = DomUtils.findAll((elem: Element) => elem.tagName.toLowerCase() === 'm-content', dom);
        const mContents2 = DomUtils.findAll((elem: Element) => elem.attribs['m-content'] != null, dom);
        const mSlots1 = DomUtils.findAll((elem: Element) => elem.tagName.toLowerCase() === 'm-slot', dom);
        const mSlots2 = DomUtils.findAll((elem: Element) => elem.attribs['m-slot'] != null, dom);

        // check counts
        Assert.AreEqual(test1divs.length, 1);
        Assert.AreEqual(test2divs.length, 2);
        Assert.AreEqual(test3div1s.length, 4);
        Assert.AreEqual(test3div2s.length, 4);
        Assert.AreEqual(test4divs.length, 6);
        Assert.AreEqual(test5divs.length, 4);
        Assert.AreEqual(spans.length, 10);
        Assert.IsEmpty(mFragments);
        Assert.IsEmpty(mContents1);
        Assert.IsEmpty(mContents2);
        Assert.IsEmpty(mSlots1);
        Assert.IsEmpty(mSlots2);
    }

    // test data
    private getPipeline(): Pipeline {
        if (this.pipeline == undefined) throw new Error('Pipeline is undefined');
        return this.pipeline;
    }
    private getPipelineInterface(): MemoryPipelineInterface {
        if (this.pipelineInterface == undefined) throw new Error('Pipeline Interface is undefined');
        return this.pipelineInterface;
    }

    // test set boilerplate

    readonly setName: string = 'FragmentOnlyTests';

    getTests(): Map<string, TestCallback> {
        return new Map<string, TestCallback>([
            ['testAsFragment', (): void => this.testAsFragment()],
            ['testAsPage', (): void => this.testAsPage()]
        ]);
    }

    // Test setup
    
    private pipelineInterface?: MemoryPipelineInterface;
    private pipeline?: Pipeline;

    beforeTest(): void {
        this.pipelineInterface = new MemoryPipelineInterface();
        this.pipeline = new PipelineImpl(this.pipelineInterface, this.pipelineInterface);

        this.pipelineInterface.htmlSource.set('page.html', `
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

        this.pipelineInterface.htmlSource.set('test1.html', `
            <div class="test1div">
                <m-fragment src="test2.html"></m-fragment>
                <m-fragment src="test2.html"></m-fragment>
            </div>
        `);

        this.pipelineInterface.htmlSource.set('test2.html', `
            <div class="test2div">
                <m-fragment src="test3.html"></m-fragment>
                <m-fragment src="test4.html"></m-fragment>
                <m-fragment src="test3.html"></m-fragment>
            </div>
        `);
        
        this.pipelineInterface.htmlSource.set('test3.html', `
            <div class="test3div1">
                <m-fragment src="test4.html"></m-fragment>
            </div>
            <div class="test3div2">
                <m-fragment src="test5.html"></m-fragment>
            </div>
        `);
        
        this.pipelineInterface.htmlSource.set('test4.html', `
            <div class="test4div">
                <span>Test 4</span>
            </div>
        `);
        
        this.pipelineInterface.htmlSource.set('test5.html', `
            <div class="test5div">
                <span>Test 5</span>
            </div>
        `);
    }
}
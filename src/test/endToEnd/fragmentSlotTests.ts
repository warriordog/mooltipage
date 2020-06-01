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

export default class FragmentSlotTests implements TestSet {

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
        const test3divs = DomUtils.findAll((elem: Element) => elem.attribs['class'] === 'test3div', dom);
        const test1slot1s = DomUtils.findAll((elem: Element) => elem.attribs['class'] === 'test1slot1', dom);
        const test1slot2s = DomUtils.findAll((elem: Element) => elem.attribs['class'] === 'test1slot2', dom);
        const test1slotDs = DomUtils.findAll((elem: Element) => elem.attribs['class'] === 'test1slotD', dom);
        const divs = DomUtils.findAll((elem: Element) => elem.tagName.toLowerCase() === 'div', dom);
        const mFragments = DomUtils.findAll((elem: Element) => elem.tagName.toLowerCase() === 'm-fragment', dom);
        const mContents1 = DomUtils.findAll((elem: Element) => elem.tagName.toLowerCase() === 'm-content', dom);
        const mContents2 = DomUtils.findAll((elem: Element) => elem.attribs['m-content'] != null, dom);
        const mSlots1 = DomUtils.findAll((elem: Element) => elem.tagName.toLowerCase() === 'm-slot', dom);
        const mSlots2 = DomUtils.findAll((elem: Element) => elem.attribs['m-slot'] != null, dom);

        // verify counts
        Assert.AreEqual(test1divs.length, 1);
        Assert.AreEqual(test2divs.length, 1);
        Assert.AreEqual(test3divs.length, 1);
        Assert.AreEqual(test1slot1s.length, 1);
        Assert.AreEqual(test1slot2s.length, 1);
        Assert.AreEqual(test1slotDs.length, 1);
        Assert.AreEqual(divs.length, 7);
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

    readonly setName: string = 'FragmentSlotTests';

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

        this.pipelineInterface.htmlSource.set('test2.html', `
            <div class="test2div">
                <m-fragment src="test3.html">
                    <m-slot name="slot1"></m-slot>
                    <div m-slot="slot2"></div>
                    <m-slot></m-slot>
                </m-fragment>
            </div>
        `);
        
        this.pipelineInterface.htmlSource.set('test3.html', `
            <div class="test3div">
                <m-slot></m-slot>
            </div>
        `);
    }
}
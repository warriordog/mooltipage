import { TestSet, TestCallback } from '../framework/testSet';
import * as Assert from '../framework/assert';
import MemoryPipelineInterface from '../mocks/memoryPipelineInterface';
import { UsageContext } from '../../lib/compiler/pipeline';
import { JSDOMPipeline, JSDOMFragment } from '../../lib/impl/jsdomPipeline';
import { JSDOM } from 'jsdom';

export default class FragmentSlotTests implements TestSet {

    // test methods

    private testAsFragment(): void {
        // compile fragment
        const fragment: JSDOMFragment = this.getPipeline().compileFragment('test1.html', new UsageContext<Node[]>());
        const dom = fragment.dom;

        // test
        this.validateContent(dom);
    }

    private testAsPage(): void {
        // compile page
        this.getPipeline().compilePage('page.html');

        // read back and extract contents
        const html: string = this.getPipelineInterface().getDestination('page.html');
        const dom: Document = (new JSDOM(html)).window.document;

        // test
        this.validateContent(dom);
    }

    // shared test code

    private validateContent(dom: Document | DocumentFragment): void {
        // verify counts
        Assert.AreEqual(dom.querySelectorAll('.test1div').length, 1);
        Assert.AreEqual(dom.querySelectorAll('.test2div').length, 1);
        Assert.AreEqual(dom.querySelectorAll('.test3div').length, 1);
        Assert.AreEqual(dom.querySelectorAll('.test1slot1').length, 1);
        Assert.AreEqual(dom.querySelectorAll('.test1slot2').length, 1);
        Assert.AreEqual(dom.querySelectorAll('.test1slotD').length, 1);
        Assert.AreEqual(dom.querySelectorAll('div').length, 7);

        // verify structure
        Assert.IsNotNullish(dom.querySelector('.test1div > .test2div > .test3div > .test1slot1'));
        Assert.IsNotNullish(dom.querySelector('.test1div > .test2div > .test3div > div > .test1slot2'));
        Assert.IsNotNullish(dom.querySelector('.test1div > .test2div > .test3div > .test1slotD'));

        // make sure no slots or fragments were left
        Assert.AreEqual(dom.querySelectorAll('m-slot, [m-slot], m-content, [m-content], m-fragment').length, 0);
    }

    // test data
    private getPipeline(): JSDOMPipeline {
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
    private pipeline?: JSDOMPipeline;

    beforeTest(): void {
        this.pipelineInterface = new MemoryPipelineInterface();
        this.pipeline = new JSDOMPipeline(this.pipelineInterface, this.pipelineInterface);

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
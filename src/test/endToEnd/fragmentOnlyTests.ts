import { TestSet, TestCallback } from '../framework/testSet';
import Assert from '../framework/assert';
import MemoryPipelineInterface from '../mocks/memoryPipelineInterface';
import { UsageContext } from '../../main/compiler/pipeline';
import { JSDOMPipeline } from '../../main/impl/jsdomPipeline';
import Fragment from '../../main/compiler/fragment';
import { JSDOM } from 'jsdom';

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
        this.getPipeline().compilePage('page.html');

        // read back and extract contents
        const html: string = this.getPipelineInterface().getDestination('page.html');
        const dom: Document = (new JSDOM(html)).window.document;

        // test
        this.validateContent(dom);
    }

    // shared test code

    private validateContent(dom: Document | DocumentFragment): void {
        // check counts
        Assert.AreEqual(dom.querySelectorAll('div.test1div').length, 1);
        Assert.AreEqual(dom.querySelectorAll('div.test2div').length, 2);
        Assert.AreEqual(dom.querySelectorAll('div.test3div1').length, 4);
        Assert.AreEqual(dom.querySelectorAll('div.test3div2').length, 4);
        Assert.AreEqual(dom.querySelectorAll('div.test4div').length, 6);
        Assert.AreEqual(dom.querySelectorAll('div.test5div').length, 4);
        Assert.AreEqual(dom.querySelectorAll('span').length, 10);

        // verify structure
        Assert.AreEqual(dom.querySelectorAll('div.test1div > div.test2div > div.test4div > span').length, 2);
        Assert.AreEqual(dom.querySelectorAll('div.test1div > div.test2div > div.test3div1 > div.test4div > span').length, 4);
        Assert.AreEqual(dom.querySelectorAll('div.test1div > div.test2div > div.test3div2 > div.test5div > span').length, 4);
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

    readonly setName: string = 'FragmentOnlyTests';

    getTests(): Map<string, TestCallback> {
        return new Map<string, TestCallback>([
            ['testAsFragment', () => this.testAsFragment()],
            ['testAsPage', () => this.testAsPage()]
        ]);
    }

    // Test setup
    
    private pipelineInterface?: MemoryPipelineInterface;
    private pipeline?: JSDOMPipeline;

    beforeTest() {
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
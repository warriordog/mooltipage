import { TestSet, TestCallback } from '../framework/testSet';
import * as Assert from '../framework/assert';
import MemoryPipelineInterface from '../mocks/memoryPipelineInterface';
import { UsageContext } from '../../lib/compiler/pipeline';
import { JSDOMPipeline } from '../../lib/impl/jsdomPipeline';
import Fragment from '../../lib/compiler/fragment';
import { JSDOM } from 'jsdom';

export default class BasicHtmlTests implements TestSet {
    // test methods
    
    private testFragment(): void {
        // compile fragment
        const fragment: Fragment = this.getPipeline().compileFragment('test1.html', new UsageContext());
        const dom = fragment.dom;

        // get contents
        const div1 = dom.querySelector('#div1');
        const div2 = dom.querySelector('#div2');
        const h1 = dom.querySelector('h1');
        const p = dom.querySelector('p');

        // verify output
        Assert.IsNotNullish(fragment);
        Assert.IsFalse(this.getPipelineInterface().hasDestination('test1.html'));

        // verify content
        Assert.IsNotNullish(div1);
        Assert.IsNotNullish(div2);
        Assert.IsNotNullish(h1);
        Assert.IsNotNullish(p);
        Assert.AreEqual(div1?.children?.length, 3);
        Assert.AreEqual(div2?.innerHTML, 'This is div2');
        Assert.AreEqual(h1?.innerHTML, 'This is h1');
        Assert.AreEqual(p?.innerHTML, 'This is p');

    }

    private testPage(): void {
        // compile page
        this.getPipeline().compilePage('test2.html');

        // read back and extract contents
        const html: string = this.getPipelineInterface().getDestination('test2.html');
        const dom: Document = (new JSDOM(html)).window.document;
        const title = dom.querySelector('title');
        const div = dom.querySelector('div');

        // verify output
        Assert.IsNotNullish(html);

        // verify content
        Assert.IsNotNullish(dom);
        Assert.IsNotNullish(title);
        Assert.IsNotNullish(div);
        Assert.AreEqual(title?.innerHTML, 'Test2 File');
        Assert.AreEqual(div?.innerHTML, 'This is the body.');

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

    readonly setName: string = 'BasicHtmlTests';

    getTests(): Map<string, TestCallback> {
        return new Map<string, TestCallback>([
            ['testFragment', (): void => this.testFragment()],
            ['testPage', (): void => this.testPage()]
        ]);
    }

    // Test setup
    
    private pipelineInterface?: MemoryPipelineInterface;
    private pipeline?: JSDOMPipeline;

    beforeTest(): void {
        this.pipelineInterface = new MemoryPipelineInterface();
        this.pipeline = new JSDOMPipeline(this.pipelineInterface, this.pipelineInterface);
        
        this.pipelineInterface.htmlSource.set('test1.html', `
            <div id="div1">
                <h1>This is h1</h1>
                <p>This is p</p>
                <div id="div2">This is div2</div>
            </div>
        `);

        this.pipelineInterface.htmlSource.set('test2.html', `
            <!DOCTYPE HTML>
            <html>
                <head>
                    <title>Test2 File</title>
                </head>
                <body>
                    <div>This is the body.</div>
                </body>
            </html>
        `);
    }
}
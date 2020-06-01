import { TestSet, TestCallback } from '../framework/testSet';
import * as Assert from '../framework/assert';
import MemoryPipelineInterface from '../mocks/memoryPipelineInterface';
import { Fragment } from '../../lib/pipeline/fragment';
import { UsageContext } from '../../lib/pipeline/usageContext';
import * as DomUtils from 'domutils';
import { Element } from 'domhandler';
import * as DomTools from '../../lib/util/domTools';
import { Dom } from '../../lib/pipeline/dom';
import { Page } from '../../lib/pipeline/page';
import { Pipeline } from '../../lib/pipeline/pipeline';
import { PipelineImpl } from '../../lib/impl/pipelineImpl';

export default class BasicHtmlTests implements TestSet {
    // test methods
    
    private testFragmentCompile(): void {
        // compile fragment
        const fragment: Fragment = this.getPipeline().compileFragment('test1.html', new UsageContext());
        const dom = fragment.dom;

        // get contents
        const div1 = DomUtils.findOne((elem: Element) => elem.attribs['id'] === 'div1', dom, true);
        const div2 = DomUtils.findOne((elem: Element) => elem.attribs['id'] === 'div2', dom, true);
        const h1 = DomUtils.findOne((elem: Element) => elem.tagName.toLowerCase() === 'h1', dom, true);
        const p = DomUtils.findOne((elem: Element) => elem.tagName.toLowerCase() === 'p', dom, true);

        // verify content
        Assert.IsNotNullish(div1);
        Assert.IsNotNullish(div2);
        Assert.IsNotNullish(h1);
        Assert.IsNotNullish(p);
        Assert.AreEqual(DomTools.getChildElements(div1)?.length, 3);
        Assert.AreEqual(DomTools.getChildText(div2), 'This is div2');
        Assert.AreEqual(DomTools.getChildText(h1), 'This is h1');
        Assert.AreEqual(DomTools.getChildText(p), 'This is p');

    }

    private testFragmentNoOutput(): void {
        // compile fragment
        this.getPipeline().compileFragment('test1.html', new UsageContext());

        // verify no output
        Assert.IsFalse(this.getPipelineInterface().hasDestination('test1.html'));
    }

    private testPageCompile(): void {
        // compile page
        const page: Page = this.getPipeline().compilePage('test2.html');
        const dom: Dom = page.dom;

        // get contents
        const title = DomUtils.findOne((elem: Element) => elem.tagName.toLowerCase() === 'title', dom, true);
        const div = DomUtils.findOne((elem: Element) => elem.tagName.toLowerCase() === 'div', dom, true);

        // verify content
        Assert.IsNotNullish(title);
        Assert.IsNotNullish(div);
        Assert.AreEqual(DomTools.getChildText(title), 'Test2 File');
        Assert.AreEqual(DomTools.getChildText(div), 'This is the body.');

    }

    private testPageOutput(): void {
        // compile page
        this.getPipeline().compilePage('test2.html');

        // verify output
        Assert.IsTrue(this.getPipelineInterface().hasDestination('test2.html'));
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

    readonly setName: string = 'BasicHtmlTests';

    getTests(): Map<string, TestCallback> {
        return new Map<string, TestCallback>([
            ['testFragmentCompile', (): void => this.testFragmentCompile()],
            ['testFragmentNoOutput', (): void => this.testFragmentNoOutput()],
            ['testPageCompile', (): void => this.testPageCompile()],
            ['testPageOutput', (): void => this.testPageOutput()]
        ]);
    }

    // Test setup
    
    private pipelineInterface?: MemoryPipelineInterface;
    private pipeline?: Pipeline;

    beforeTest(): void {
        this.pipelineInterface = new MemoryPipelineInterface();
        this.pipeline = new PipelineImpl(this.pipelineInterface, this.pipelineInterface);
        
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
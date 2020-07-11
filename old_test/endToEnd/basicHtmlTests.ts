import { TestSet, TestCallback } from '../framework/testSet';
import * as Assert from '../framework/assert';
import { MemoryPipelineInterface } from '../mocks/memoryPipelineInterface';
import { Fragment } from '../../lib/pipeline/object/fragment';
import { UsageContext } from '../../lib/pipeline/usageContext';
import { DocumentNode, Node, TagNode, TextNode } from '../../lib/dom/node';
import { Pipeline } from '../../lib/pipeline/pipeline';
import { Page } from '../../lib/pipeline/object/page';

export class BasicHtmlTests implements TestSet {
    // test methods
    
    private testFragmentCompile(): void {
        // compile fragment
        const fragment: Fragment = this.getPipeline().compileFragment('test1.html', new UsageContext(new Page('123', new DocumentNode())));
        const dom: DocumentNode = fragment.dom;

        // get contents
        const div1 = dom.findChildTag((node: TagNode) => node.getAttribute('id') === 'div1', true);
        const div2 = dom.findChildTag((node: TagNode) => node.getAttribute('id') === 'div2', true);
        const div2text = div2?.firstChild;
        const div2textText = (div2text as TextNode).text;
        const h1 = dom.findChildTag((node: TagNode) => node.tagName === 'h1', true);
        const h1text = h1?.firstChild;
        const h1textText = (h1text as TextNode).text;
        const p = dom.findChildTag((node: TagNode) => node.tagName === 'p', true);
        const ptext = p?.firstChild;
        const ptextText = (ptext as TextNode).text;

        // verify content
        Assert.IsNotNullish(div1);
        Assert.IsNotNullish(div2);
        Assert.IsNotNullish(h1);
        Assert.IsNotNullish(p);
        Assert.IsNotNullish(div2text);
        Assert.IsNotNullish(h1text);
        Assert.IsNotNullish(ptext);
        Assert.IsTrue(TextNode.isTextNode(div2text as Node));
        Assert.IsTrue(TextNode.isTextNode(h1text as Node));
        Assert.IsTrue(TextNode.isTextNode(ptext as Node));
        Assert.AreEqual(3, div1?.getChildTags().length);
        Assert.AreEqual('This is div2', div2textText);
        Assert.AreEqual('This is h1', h1textText);
        Assert.AreEqual('This is p', ptextText);

    }

    private testFragmentNoOutput(): void {
        // compile fragment
        this.getPipeline().compileFragment('test1.html', new UsageContext(new Page('123', new DocumentNode())));

        // verify no output
        Assert.IsFalse(this.getPipelineInterface().hasDestination('test1.html'));
    }

    private testPageCompile(): void {
        // compile page
        const page: Fragment = this.getPipeline().compilePage('test2.html');
        const dom: DocumentNode = page.dom;

        // get contents
        const title = dom.findChildTag((node: TagNode) => node.tagName === 'title', true);
        const titletext = title?.firstChild;
        const titletextText = (titletext as TextNode).text;
        const div = dom.findChildTag((node: TagNode) => node.tagName === 'div', true);
        const divtext = div?.firstChild;
        const divtextText = (divtext as TextNode).text;

        // verify content
        Assert.IsNotNullish(title);
        Assert.IsNotNullish(div);
        Assert.IsNotNullish(titletext);
        Assert.IsNotNullish(divtext);
        Assert.IsTrue(TextNode.isTextNode(titletext as Node));
        Assert.IsTrue(TextNode.isTextNode(divtext as Node));
        Assert.AreEqual('Test2 File', titletextText);
        Assert.AreEqual('This is the body.', divtextText);

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

    readonly setName: string = 'BasicHtml';

    getTests(): Map<string, TestCallback> {
        return new Map<string, TestCallback>([
            ['FragmentCompile', (): void => this.testFragmentCompile()],
            ['FragmentNoOutput', (): void => this.testFragmentNoOutput()],
            ['PageCompile', (): void => this.testPageCompile()],
            ['PageOutput', (): void => this.testPageOutput()]
        ]);
    }

    // Test setup
    
    private pipelineInterface?: MemoryPipelineInterface;
    private pipeline?: Pipeline;

    beforeTest(): void {
        this.pipelineInterface = new MemoryPipelineInterface();
        this.pipeline = new Pipeline(this.pipelineInterface);
        
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
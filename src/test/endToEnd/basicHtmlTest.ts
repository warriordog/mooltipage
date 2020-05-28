import { TestSet, TestCallback } from '../framework/testSet';
import Assert from '../framework/assert';
import MemoryPipelineInterface from '../mocks/memoryPipelineInterface';
import { Pipeline, HtmlParser, FragmentCompiler, FragmentSerializer } from '../../main/compiler/pipeline';
import Fragment from '../../main/compiler/fragment';

export default class BasicHtmlTest implements TestSet {
    // test methods
    
    testRawFragmentProcessed(): void {
        const fragment: Fragment = this.pipeline.processFragment('test1.html');

        Assert.IsNotNullish(fragment);
    }
    
    testRawFragmentNotExported(): void {
        this.pipeline.processFragment('test1.html');

        Assert.IsFalse(this.pipelineInterface.htmlDestination.has('test1.html'));
    }

    testPageFragmentProcessed(): void {
        const fragment: Fragment = this.pipeline.processFragment('test2.html');

        Assert.IsNotNullish(fragment);
    }

    testPageFragmentExported(): void {
        this.pipeline.processFragment('test2.html');

        Assert.IsTrue(this.pipelineInterface.htmlDestination.has('test2.html'));
        Assert.IsNotNullish(this.pipelineInterface.htmlDestination.get('test2.html'))
    }

    // test set boilerplate

    getName(): string {
        return 'BasicHtmlTests';
    }

    getTests(): Map<string, TestCallback> {
        return new Map<string, TestCallback>([
            ['testRawFragmentProcessed', () => this.testRawFragmentProcessed()],
            ['testRawFragmentNotExported', () => this.testRawFragmentNotExported()],
            ['testPageFragmentProcessed', () => this.testPageFragmentProcessed()],
            ['testPageFragmentExported', () => this.testPageFragmentExported()]
        ]);
    }

    // Test setup
    
    private _pipelineInterface?: MemoryPipelineInterface;
    private _pipeline?: Pipeline;

    private get pipeline(): Pipeline {
        if (this._pipeline == undefined) {
            throw new Error('pipeline is undefined');
        }
        
        return this._pipeline;
    }

    private get pipelineInterface(): MemoryPipelineInterface {
        if (this._pipelineInterface == undefined) {
            throw new Error('pipeline interface is undefined');
        }
        
        return this._pipelineInterface;
    }

    beforeTest() {
        this._pipelineInterface = new MemoryPipelineInterface();
        this._pipeline = new Pipeline(this._pipelineInterface, new HtmlParser(), new FragmentCompiler(), new FragmentSerializer, this._pipelineInterface);
        
        this.pipelineInterface.htmlSource.set('test1.html', `
            <!DOCTYPE HTML>
            <html>
                <head>
                    <title>Hello, world!</title>
                </head>
                <body>
                    <div id="content">
                        <h1>This is h1</h1>
                        <p>This is p</p>
                        <div>This is div</div>
                    </div>
                </body>
            </html>
        `);

        this.pipelineInterface.htmlSource.set('test2.html', `
            <m-page dest="test2.html"></m-page>
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
import { TestSet, TestCallback } from '../framework/testSet';
import * as Assert from '../framework/assert';
import { MemoryPipelineInterface } from '../mocks/memoryPipelineInterface';
import { Fragment } from '../../lib/pipeline/object/fragment';
import { UsageContext } from '../../lib/pipeline/usageContext';
import { DocumentNode, TagNode } from '../../lib/dom/node';
import { Pipeline } from '../../lib/pipeline/pipeline';
import { Page } from '../../lib/pipeline/object/page';

export class FragmentParamTests implements TestSet {
    
    private testSetNoParams(): void {
        // compile fragment
        const fragment: Fragment = this.getPipeline().compileFragment('noParams1.html', new UsageContext(new Page('123', new DocumentNode())));
        const dom: DocumentNode = fragment.dom;
        
        // get content
        const valueKey = dom.findChildTag((node: TagNode) => node.getAttribute('id') === 'noParams')?.getAttribute('result');

        // validate
        Assert.AreEqual('value', valueKey);
    }

    private testSetParamOnly(): void {
        // compile fragment
        const fragment: Fragment = this.getPipeline().compileFragment('paramOnly1.html', new UsageContext(new Page('123', new DocumentNode())));
        const dom: DocumentNode = fragment.dom;
        
        // get content
        const paramKey = dom.findChildTag((node: TagNode) => node.getAttribute('id') === 'paramOnly')?.getAttribute('result');

        // validate
        Assert.AreEqual('value', paramKey);
    }

    private testSetValueOverwrite(): void {
        // compile fragment
        const fragment: Fragment = this.getPipeline().compileFragment('valueOverwrite1.html', new UsageContext(new Page('123', new DocumentNode())));
        const dom: DocumentNode = fragment.dom;
        
        // get content
        const paramKey = dom.findChildTag((node: TagNode) => node.getAttribute('id') === 'valueOverwrite')?.getAttribute('result');

        // validate
        Assert.AreEqual('inner', paramKey);
    }


    // test data
    private getPipeline(): Pipeline {
        if (this.pipeline == undefined) throw new Error('Pipeline is undefined');
        return this.pipeline;
    }

    // test set boilerplate

    readonly setName: string = 'FragmentParam';

    getTests(): Map<string, TestCallback> {
        return new Map<string, TestCallback>([
            ['NoParams', (): void => this.testSetNoParams()],
            ['ParamOnly', (): void => this.testSetParamOnly()],
            ['ValueOverwrite', (): void => this.testSetValueOverwrite()]
        ]);
    }
    
    // Test setup

    private pipeline?: Pipeline;

    beforeTest(): void {
        const pipelineInterface = new MemoryPipelineInterface();
        this.pipeline = new Pipeline(pipelineInterface);

        pipelineInterface.htmlSource.set('noParams1.html', `
            <div>
                <m-fragment src="noParams2.html"></m-fragment>
            </div>
        `);
        pipelineInterface.htmlSource.set('noParams2.html', `
            <m-var valuekey="value"></m-var>
            <div id="noParams" result="\${ $.valuekey }"></div>
        `);

        pipelineInterface.htmlSource.set('paramOnly1.html', `
            <div>
                <m-fragment src="paramOnly2.html" paramkey="value"></m-fragment>
            </div>
        `);
        pipelineInterface.htmlSource.set('paramOnly2.html', `
            <div id="paramOnly" result="\${ $.paramkey }"></div>
        `);

        pipelineInterface.htmlSource.set('valueOverwrite1.html', `
            <div>
                <m-fragment src="valueOverwrite2.html" paramkey="outer"></m-fragment>
            </div>
        `);
        pipelineInterface.htmlSource.set('valueOverwrite2.html', `
            <m-var paramkey="inner"></m-var>
            <div id="valueOverwrite" result="\${ $.paramkey }"></div>
        `);
    }
}
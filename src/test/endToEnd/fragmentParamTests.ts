import { TestSet, TestCallback } from '../framework/testSet';
import * as Assert from '../framework/assert';
import { MemoryPipelineInterface } from '../mocks/memoryPipelineInterface';
import { Fragment } from '../../lib/pipeline/object/fragment';
import { UsageContext } from '../../lib/pipeline/usageContext';
import { DocumentNode, TagNode, TextNode } from '../../lib/dom/node';
import { Pipeline } from '../../lib/pipeline/pipeline';

export class FragmentParamTests implements TestSet {

    private testSetPage(): void {
        // compile page
        const page: Fragment = this.getPipeline().compilePage('setPage.html');
        const dom: DocumentNode = page.dom;
        
        // get content
        const mVars = dom.findChildTags((node: TagNode) => node.tagName === 'm-var');
        const text = dom.findChildTag((node: TagNode) => node.tagName === 'div')?.firstChild as TextNode | null | undefined;

        // validate
        Assert.IsEmpty(mVars);
        Assert.IsNotNull(text);
        Assert.AreEqual(text?.text, 'value');
    }

    private testSetFragment(): void {
        // compile fragment
        const fragment: Fragment = this.getPipeline().compileFragment('setFragment.html', new UsageContext(false));
        const dom: DocumentNode = fragment.dom;
        
        // get content
        const mVars = dom.findChildTags((node: TagNode) => node.tagName === 'm-var');
        const text = dom.findChildTag((node: TagNode) => node.tagName === 'div')?.firstChild as TextNode | null | undefined;

        // validate
        Assert.IsEmpty(mVars);
        Assert.IsNotNull(text);
        Assert.AreEqual(text?.text, 'value');
    }

    private testSetMulti(): void {
        // compile fragment
        const fragment: Fragment = this.getPipeline().compileFragment('setMulti.html', new UsageContext(false));
        const dom: DocumentNode = fragment.dom;
        
        // get content
        const mVars = dom.findChildTags((node: TagNode) => node.tagName === 'm-var');
        const text1 = dom.findChildTag((node: TagNode) => node.attributes.get('id') === 'key1')?.firstChild as TextNode | null | undefined;
        const text2 = dom.findChildTag((node: TagNode) => node.attributes.get('id') === 'key2')?.firstChild as TextNode | null | undefined;
        const text3 = dom.findChildTag((node: TagNode) => node.attributes.get('id') === 'key3')?.firstChild as TextNode | null | undefined;

        // validate
        Assert.IsEmpty(mVars);
        Assert.IsNotNull(text1);
        Assert.IsNotNull(text2);
        Assert.IsNotNull(text3);
        Assert.AreEqual(text1?.text, 'value1');
        Assert.AreEqual(text2?.text, 'value2');
        Assert.AreEqual(text3?.text, 'value3');
    }

    private testSetMultiMulti(): void {
        // compile fragment
        const fragment: Fragment = this.getPipeline().compileFragment('setMultiMulti.html', new UsageContext(false));
        const dom: DocumentNode = fragment.dom;
        
        // get content
        const mVars = dom.findChildTags((node: TagNode) => node.tagName === 'm-var');
        const text1 = dom.findChildTag((node: TagNode) => node.attributes.get('id') === 'key1')?.firstChild as TextNode | null | undefined;
        const text2 = dom.findChildTag((node: TagNode) => node.attributes.get('id') === 'key2')?.firstChild as TextNode | null | undefined;
        const text3 = dom.findChildTag((node: TagNode) => node.attributes.get('id') === 'key3')?.firstChild as TextNode | null | undefined;
        const text4 = dom.findChildTag((node: TagNode) => node.attributes.get('id') === 'key4')?.firstChild as TextNode | null | undefined;
        const text5 = dom.findChildTag((node: TagNode) => node.attributes.get('id') === 'key5')?.firstChild as TextNode | null | undefined;
        const text6 = dom.findChildTag((node: TagNode) => node.attributes.get('id') === 'key6')?.firstChild as TextNode | null | undefined;

        // validate
        Assert.IsEmpty(mVars);
        Assert.IsNotNull(text1);
        Assert.IsNotNull(text2);
        Assert.IsNotNull(text3);
        Assert.IsNotNull(text4);
        Assert.IsNotNull(text5);
        Assert.IsNotNull(text6);
        Assert.AreEqual(text1?.text, 'value1');
        Assert.AreEqual(text2?.text, 'value2');
        Assert.AreEqual(text3?.text, 'value3');
        Assert.AreEqual(text4?.text, 'value4');
        Assert.AreEqual(text5?.text, 'value5');
        Assert.AreEqual(text6?.text, 'value6');
    }

    private testSetNoParams(): void {
        // compile fragment
        const fragment: Fragment = this.getPipeline().compileFragment('noParams1.html', new UsageContext(false));
        const dom: DocumentNode = fragment.dom;
        
        // get content
        const valueKey = dom.findChildTag((node: TagNode) => node.attributes.get('id') === 'noParams')?.attributes.get('result');

        // validate
        Assert.AreEqual(valueKey, 'value');
    }

    private testSetParamOnly(): void {
        // compile fragment
        const fragment: Fragment = this.getPipeline().compileFragment('paramOnly1.html', new UsageContext(false));
        const dom: DocumentNode = fragment.dom;
        
        // get content
        const paramKey = dom.findChildTag((node: TagNode) => node.attributes.get('id') === 'paramOnly')?.attributes.get('result');

        // validate
        Assert.AreEqual(paramKey, 'value');
    }

    private testSetValueOverwrite(): void {
        // compile fragment
        const fragment: Fragment = this.getPipeline().compileFragment('valueOverwrite1.html', new UsageContext(false));
        const dom: DocumentNode = fragment.dom;
        
        // get content
        const paramKey = dom.findChildTag((node: TagNode) => node.attributes.get('id') === 'valueOverwrite')?.attributes.get('result');

        // validate
        Assert.AreEqual(paramKey, 'inner');
    }


    // test data
    private getPipeline(): Pipeline {
        if (this.pipeline == undefined) throw new Error('Pipeline is undefined');
        return this.pipeline;
    }

    // test set boilerplate

    readonly setName: string = 'FragmentParamTests';

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
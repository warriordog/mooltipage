import { TestSet, TestCallback } from '../framework/testSet';
import * as Assert from '../framework/assert';
import { MemoryPipelineInterface } from '../mocks/memoryPipelineInterface';
import { Fragment } from '../../lib/pipeline/object/fragment';
import { UsageContext } from '../../lib/pipeline/usageContext';
import { DocumentNode, TagNode, TextNode } from '../../lib/dom/node';
import { Pipeline } from '../../lib/pipeline/pipeline';
import { Page } from '../../lib/pipeline/object/page';

export class VarsTests implements TestSet {

    private testSetFragment(): void {
        this.testBasic('setFragment.html');
    }

    private testSetMulti(): void {
        // compile fragment
        const fragment: Fragment = this.getPipeline().compileFragment('setMulti.html', new UsageContext(new Page('123', new DocumentNode())));
        const dom: DocumentNode = fragment.dom;
        
        // get content
        const mVars = dom.findChildTags((node: TagNode) => node.tagName === 'm-var');
        const text1 = dom.findChildTag((node: TagNode) => node.getAttribute('id') === 'key1')?.firstChild as TextNode | null | undefined;
        const text1text = text1?.text;
        const text2 = dom.findChildTag((node: TagNode) => node.getAttribute('id') === 'key2')?.firstChild as TextNode | null | undefined;
        const text2text = text2?.text;
        const text3 = dom.findChildTag((node: TagNode) => node.getAttribute('id') === 'key3')?.firstChild as TextNode | null | undefined;
        const text3text = text3?.text;

        // validate
        Assert.IsEmpty(mVars);
        Assert.IsNotNull(text1);
        Assert.IsNotNull(text2);
        Assert.IsNotNull(text3);
        Assert.AreEqual('value1', text1text);
        Assert.AreEqual('value2', text2text);
        Assert.AreEqual('value3', text3text);
    }

    private testSetMultiMulti(): void {
        // compile fragment
        const fragment: Fragment = this.getPipeline().compileFragment('setMultiMulti.html', new UsageContext(new Page('123', new DocumentNode())));
        const dom: DocumentNode = fragment.dom;
        
        // get content
        const mVars = dom.findChildTags((node: TagNode) => node.tagName === 'm-var');
        const text1 = dom.findChildTag((node: TagNode) => node.getAttribute('id') === 'key1')?.firstChild as TextNode | null | undefined;
        const text1text = text1?.text;
        const text2 = dom.findChildTag((node: TagNode) => node.getAttribute('id') === 'key2')?.firstChild as TextNode | null | undefined;
        const text2text = text2?.text;
        const text3 = dom.findChildTag((node: TagNode) => node.getAttribute('id') === 'key3')?.firstChild as TextNode | null | undefined;
        const text3text = text3?.text;
        const text4 = dom.findChildTag((node: TagNode) => node.getAttribute('id') === 'key4')?.firstChild as TextNode | null | undefined;
        const text4text = text4?.text;
        const text5 = dom.findChildTag((node: TagNode) => node.getAttribute('id') === 'key5')?.firstChild as TextNode | null | undefined;
        const text5text = text5?.text;
        const text6 = dom.findChildTag((node: TagNode) => node.getAttribute('id') === 'key6')?.firstChild as TextNode | null | undefined;
        const text6text = text6?.text;

        // validate
        Assert.IsEmpty(mVars);
        Assert.IsNotNull(text1);
        Assert.IsNotNull(text2);
        Assert.IsNotNull(text3);
        Assert.IsNotNull(text4);
        Assert.IsNotNull(text5);
        Assert.IsNotNull(text6);
        Assert.AreEqual('value1', text1text);
        Assert.AreEqual('value2', text2text);
        Assert.AreEqual('value3', text3text);
        Assert.AreEqual('value4', text4text);
        Assert.AreEqual('value5', text5text);
        Assert.AreEqual('value6', text6text);
    }

    private testSetComputedHandlebars(): void {
        this.testBasic('setComputedHandlebars.html');
    }

    private testSetComputedTemplate(): void {
        this.testBasic('setComputedTemplate.html');
    }

    private testSetComputedMixed(): void {
        // compile fragment
        const fragment: Fragment = this.getPipeline().compileFragment('setComputedMixed.html', new UsageContext(new Page('123', new DocumentNode())));
        const dom: DocumentNode = fragment.dom;
        
        // get content
        const mVars = dom.findChildTags((node: TagNode) => node.tagName === 'm-var');
        const text1 = dom.findChildTag((node: TagNode) => node.getAttribute('id') === 'key1')?.firstChild as TextNode | null | undefined;
        const text1text = text1?.text;
        const text2 = dom.findChildTag((node: TagNode) => node.getAttribute('id') === 'key2')?.firstChild as TextNode | null | undefined;
        const text2text = text2?.text;

        // validate
        Assert.IsEmpty(mVars);
        Assert.IsNotNull(text1);
        Assert.IsNotNull(text2);
        Assert.AreEqual('value1', text1text);
        Assert.AreEqual('value2', text2text);
    }

    // shared test code

    private testBasic(resId: string): void {
        const fragment: Fragment = this.getPipeline().compileFragment(resId, new UsageContext(new Page('123', new DocumentNode())));
        const dom: DocumentNode = fragment.dom;
        
        // get content
        const mVars = dom.findChildTags((node: TagNode) => node.tagName === 'm-var');
        const text = dom.findChildTag((node: TagNode) => node.tagName === 'div')?.firstChild as TextNode | null | undefined;
        const textText = text?.text;

        // validate
        Assert.IsEmpty(mVars);
        Assert.IsNotNull(text);
        Assert.AreEqual('value', textText);
    }


    // test data
    private getPipeline(): Pipeline {
        if (this.pipeline == undefined) throw new Error('Pipeline is undefined');
        return this.pipeline;
    }

    // test set boilerplate

    readonly setName: string = 'Vars';

    getTests(): Map<string, TestCallback> {
        return new Map<string, TestCallback>([
            ['SetFragment', (): void => this.testSetFragment()],
            ['SetMulti', (): void => this.testSetMulti()],
            ['SetMultiMulti', (): void => this.testSetMultiMulti()],
            ['SetComputedHandlebars', (): void => this.testSetComputedHandlebars()],
            ['SetComputedTemplate', (): void => this.testSetComputedTemplate()],
            ['SetComputedMixed', (): void => this.testSetComputedMixed()]
        ]);
    }
    
    // Test setup

    private pipeline?: Pipeline;

    beforeTest(): void {
        const pipelineInterface = new MemoryPipelineInterface();
        this.pipeline = new Pipeline(pipelineInterface);

        pipelineInterface.htmlSource.set('setFragment.html', `
            <m-var key="value"></m-var>
            <div>\${ $.key }</div>
        `);

        pipelineInterface.htmlSource.set('setMulti.html', `
            <m-var key1="value1" key2="value2" key3="value3"></m-var>
            <div id="key1">\${ $.key1 }</div>
            <div id="key2">\${ $.key2 }</div>
            <div id="key3">\${ $.key3 }</div>
        `);

        pipelineInterface.htmlSource.set('setMultiMulti.html', `
            <m-var key1="value1" key2="value2" key3="value3"></m-var>
            <m-var key4="value4" key5="value5" key6="value6"></m-var>
            <div id="key1">\${ $.key1 }</div>
            <div id="key2">\${ $.key2 }</div>
            <div id="key3">\${ $.key3 }</div>
            <div id="key4">\${ $.key4 }</div>
            <div id="key5">\${ $.key5 }</div>
            <div id="key6">\${ $.key6 }</div>
        `);

        pipelineInterface.htmlSource.set('setComputedHandlebars.html', `
            <m-var key="{{ 'value' }}"></m-var>
            <div id="key">\${ $.key }</div>
        `);

        pipelineInterface.htmlSource.set('setComputedTemplate.html', `
            <m-var key="\${ 'value' }"></m-var>
            <div id="key">\${ $.key }</div>
        `);

        pipelineInterface.htmlSource.set('setComputedMixed.html', `
            <m-var key1="{{ 'value1' }}" key2="\${ 'value2' }"></m-var>
            <div id="key1">\${ $.key1 }</div>
            <div id="key2">\${ $.key2 }</div>
        `);
    }
}
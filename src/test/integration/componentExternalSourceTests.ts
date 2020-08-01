import test from 'ava';
import { MemoryPipelineInterface } from '../_mocks/memoryPipelineInterface';
import { ResourceType, TagNode, Node, DocumentNode, Fragment } from '../../lib';
import { StandardPipeline, PipelineContext } from '../../lib/pipeline/standardPipeline';
import { EvalContext } from '../../lib/pipeline/module/evalEngine';

test('[integration] Components should load external templates', t => {
    const templateText = '<div class="component"></div>';

    const pi = new MemoryPipelineInterface();
    pi.setSource('comp_template.html', {
        type: ResourceType.HTML,
        content: templateText
    });
    const pipeline = new StandardPipeline(pi);

    const htmlParser = pipeline.resourceParser;
    const component = htmlParser.parseComponent('component.html', `
        <template src="comp_template.html" />
        <script>return class {}</script>
    `);

    t.truthy(component);
    t.is(component.template.srcResPath, 'comp_template.html');

    const dom = component.template.dom;
    t.truthy(dom.firstChild);
    t.true(TagNode.isTagNode(dom.firstChild as Node));
    t.true((dom.firstChild as TagNode).getAttribute('class') === 'component');
});

test('[integration] Components should load external scripts', t => {
    const scriptText = `
        return class Component {
            constructor() {
                this.test = 'test';
            }
        }
    `;

    const pi = new MemoryPipelineInterface();
    pi.setSource('comp_script.js', {
        type: ResourceType.JAVASCRIPT,
        content: scriptText
    });
    const pipeline = new StandardPipeline(pi);

    const htmlParser = pipeline.resourceParser;
    const component = htmlParser.parseComponent('component.html', `
        <template>\${ $.test }</template>
        <script src="comp_script.js" />
    `);
    const testFrag: Fragment = {
        path: 'page.html',
        dom: new DocumentNode()
    };
    const testContext: PipelineContext = {
        pipeline: pipeline,
        fragment: testFrag,
        fragmentContext: {
            parameters: new Map(),
            slotContents: new Map(),
            scope: {}
        }
    };
    const evalContext = new EvalContext(testContext, testContext.fragmentContext.scope);

    t.truthy(component);
    t.is(component.script.srcResPath, 'comp_script.js');

    const scriptObj = component.script.scriptFunction.invoke(evalContext);
    t.truthy(scriptObj);
    t.is(scriptObj.test, 'test');
});

test('[integration] Components should load external styles', t => {
    const styleText = '.component {}';

    const pi = new MemoryPipelineInterface();
    pi.setSource('comp_style.css', {
        type: ResourceType.CSS,
        content: styleText
    });
    const pipeline = new StandardPipeline(pi);

    const htmlParser = pipeline.resourceParser;
    const component = htmlParser.parseComponent('component.html', `
        <template><div class="component"></div></template>
        <script>return class {}</script>
        <style src="comp_style.css" />
    `);

    t.truthy(component);
    t.truthy(component.style);
    t.is(component.style?.styleContent, styleText);
});

test('[integration] Components should load all external section', t => {
    const templateText = '<div class="component">${ $.test }</div>';
    const scriptText = `
        return class Component {
            constructor() {
                this.test = 'test';
            }
        }
    `;
    const styleText = '.component {}';

    
    const pi = new MemoryPipelineInterface();
    pi.setSource('comp_template.html', {
        type: ResourceType.HTML,
        content: templateText
    });
    pi.setSource('comp_script.js', {
        type: ResourceType.JAVASCRIPT,
        content: scriptText
    });
    pi.setSource('comp_style.css', {
        type: ResourceType.CSS,
        content: styleText
    });
    const pipeline = new StandardPipeline(pi);
    const testFrag: Fragment = {
        path: 'page.html',
        dom: new DocumentNode()
    };
    const testContext: PipelineContext = {
        pipeline: pipeline,
        fragment: testFrag,
        fragmentContext: {
            parameters: new Map(),
            slotContents: new Map(),
            scope: {}
        }
    };
    const evalContext = new EvalContext(testContext, testContext.fragmentContext.scope);

    const htmlParser = pipeline.resourceParser;
    const component = htmlParser.parseComponent('component.html', `
        <template src="comp_template.html" />
        <script src="comp_script.js"></script>
        <style src="comp_style.css" />
    `);

    t.truthy(component);
    t.truthy(component.template);
    t.truthy(component.script);
    t.truthy(component.style);

    const dom = component.template.dom;
    t.truthy(dom.firstChild);
    t.true(TagNode.isTagNode(dom.firstChild as Node));
    t.true((dom.firstChild as TagNode).getAttribute('class') === 'component');
    
    const scriptObj = component.script.scriptFunction.invoke(evalContext);
    t.truthy(scriptObj);
    t.is(scriptObj.test, 'test');
    
    t.is(component.style?.styleContent, styleText);
});
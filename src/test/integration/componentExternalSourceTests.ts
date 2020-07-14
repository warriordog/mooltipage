import test from 'ava';
import { Pipeline, ResourceType, UsageContext, Page, DocumentNode, Node, TagNode, EvalContext } from '../../lib/index';
import { MemoryPipelineInterface } from '../_mocks/memoryPipelineInterface';

test('[integration] Components should load external templates', t => {
    const templateText = '<div class="component"></div>';

    const pi = new MemoryPipelineInterface();
    pi.setSource('comp_template.html', {
        type: ResourceType.HTML,
        content: templateText
    });
    const pipeline = new Pipeline(pi);

    const htmlParser = pipeline.htmlParser;
    const component = htmlParser.parseComponent('component.html', `
        <template src="comp_template.html" />
        <script>return class {}</script>
    `);

    t.truthy(component);
    t.is(component.template.srcResId, 'comp_template.html');

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
    const pipeline = new Pipeline(pi);

    const htmlParser = pipeline.htmlParser;
    const component = htmlParser.parseComponent('component.html', `
        <template>\${ $.test }</template>
        <script src="comp_script.js" />
    `);
    const testPage = new Page('page.html', new DocumentNode());
    const testContext = new UsageContext(testPage);
    const evalContext = new EvalContext(pipeline, testPage, testContext, new Map());

    t.truthy(component);
    t.is(component.script.srcResId, 'comp_script.js');

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
    const pipeline = new Pipeline(pi);

    const htmlParser = pipeline.htmlParser;
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
    const pipeline = new Pipeline(pi);
    const testPage = new Page('page.html', new DocumentNode());
    const testContext = new UsageContext(testPage);
    const evalContext = new EvalContext(pipeline, testPage, testContext, new Map());

    const htmlParser = pipeline.htmlParser;
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
import test from 'ava';
import { Pipeline, BasicHtmlFormatter } from '../../lib';
import { MemoryPipelineInterface } from '../_mocks/memoryPipelineInterface';

function createRootPi(): MemoryPipelineInterface {
    const pi = new MemoryPipelineInterface();
    pi.setSourceHtml('page.html', '<!DOCTYPE html><html><head><title>Component Tests</title></head><body><m-component src="comp.html" /></body></html>');

    return pi;
}

test('[endToEnd] Basic component compiles correctly', t => {
    // set up pipeline
    const pi = createRootPi();
    pi.setSourceHtml('comp.html', `
        <template>
            <div class="comp"></div>
        </template>
        <script mode="class">
            return class Comp {
                constructor(scope, context) {}
            }
        </script>
        <style bind="head">
            .comp {}
        </style>
    `);
    const pipeline = new Pipeline(pi);

    // compile component
    const output = pipeline.compilePage('page.html');
    const page = output.page;
    const div = page.dom.findChildTagByTagName('div');
    const style = page.dom.findChildTagByTagName('style');

    // validate
    t.truthy(div);
    t.is(div?.getAttribute('class'), 'comp');
    t.truthy(style);
});

test('[endToEnd] Component with scope compiles correctly', t => {
    // set up pipeline
    const pi = createRootPi();
    pi.setSourceHtml('comp.html', `
        <template>
            <div class="comp" value1="\${ $.value1 }" value2="{{ $.value2 }}"></div>
        </template>
        <script mode="class">
            return class Comp {
                constructor(scope, context) {
                    this.value1 = "value1";
                    this.value2 = "value2";
                }
            }
        </script>
    `);
    const pipeline = new Pipeline(pi);

    // compile component
    const output = pipeline.compilePage('page.html');
    const page = output.page;
    const div = page.dom.findChildTagByTagName('div');

    // validate
    t.is(div?.getAttribute('value1'), 'value1', 'component object should be available to template text scope');
    t.is(div?.getAttribute('value2'), 'value2', 'component object should be available to handlebars scope');
});

test('[endToEnd] Nested components compile correctly', t => {
    // set up pipeline
    const pi = createRootPi();
    pi.setSourceHtml('comp.html', `
        <template>
            <div class="comp1" value="{{ $.value }}"></div>
            <m-component src="comp2.html" param="{{ $.value }}" />
        </template>
        <script mode="class">
            return class Comp {
                constructor(scope, context) {
                    this.value = "value";
                }
            }
        </script>
    `);
    pi.setSourceHtml('comp2.html', `
        <template>
            <div class="comp2" value="{{ $.value }}" param="{{ $.param }}"></div>
        </template>
        <script mode="class">
            return class Comp2 {
                constructor(scope, context) {
                    this.value = "value2";
                }
            }
        </script>
    `);
    const pipeline = new Pipeline(pi);

    // compile component
    const output = pipeline.compilePage('page.html');
    const page = output.page;
    const comp = page.dom.findChildTag(tag => tag.tagName === 'div' && tag.getAttribute('class') === 'comp1');
    const comp2 = page.dom.findChildTag(tag => tag.tagName === 'div' && tag.getAttribute('class') === 'comp2');

    // validate
    t.truthy(comp);
    t.truthy(comp2);
    t.is(comp?.getAttribute('value'), 'value', 'outer component should have isolated scope');
    t.is(comp2?.getAttribute('value'), 'value2', 'inner component should have isolated scope');
    t.is(comp2?.getAttribute('param'), 'value', 'parameters should be merged into inner scope');
});

test('[endToEnd] Components compile to correct DOM', t => {
    // set up pipeline
    const pi = createRootPi();
    pi.setSourceHtml('comp.html', `
        <template>
            <div class="comp1">
                <p>\${ $.hello }</p>
                <m-component src="comp2.html" />
                <p>\${ $.world }</p>
            </div>
        </template>
        <script mode="class">
            return class Comp {
                constructor(scope, context) {
                    this.hello = "Hello,";
                    this.world = "World!";
                }
            }
        </script>
        <style bind="head">
            .comp1 {}
        </style>
    `);
    pi.setSourceHtml('comp2.html', `
        <template>
            <div class="comp2">\${ $.message }</div>
        </template>
        <script mode="class">
            return class Comp2 {
                constructor(scope, context) {
                    this.message = "This is component 2.";
                }
            }
        </script>
        <style bind="head">
            .comp2 {}
        </style>
    `);
    const htmlFormatter = new BasicHtmlFormatter(false);
    const pipeline = new Pipeline(pi, htmlFormatter);

    // compile component
    const output = pipeline.compilePage('page.html');

    // validate
    t.is(output.html, '<!DOCTYPE html><html><head><title>Component Tests</title><style>.comp2 {}</style><style>.comp1 {}</style></head><body><div class="comp1"><p>Hello,</p><div class="comp2">This is component 2.</div><p>World!</p></div></body></html>');
});

test('[endToEnd] Repeated component usages have correct scope', t => {
    // set up pipeline
    const pi = createRootPi();
    pi.setSourceHtml('comp.html', `
        <template>
            <div class="comp1">
                <m-component src="comp2.html" id="1" param="value1" value="{{ $.sharedValue }}" />
                <m-component src="comp2.html" id="2" param="value2" value="{{ $.sharedValue }}" />
                <m-component src="comp2.html" id="3" param="value3" value="{{ $.sharedValue }}" />
                <m-component src="comp2.html" id="4" param="value4" value="{{ $.sharedValue }}" />
            </div>
        </template>
        <script mode="class">
            return class Comp {
                constructor(scope, context) {
                    this.sharedValue = 'value';
                }
            }
        </script>
    `);
    pi.setSourceHtml('comp2.html', `
        <template>
            <div class="comp2" id="{{ $.id }}" param="{{ $.param }}" value="{{ $.thisValue }}"></div>
        </template>
        <script mode="class">
            return class Comp2 {
                constructor(scope, context) {
                    this.thisValue = scope.value;
                }
            }
        </script>
    `);
    const pipeline = new Pipeline(pi);

    // compile component
    const output = pipeline.compilePage('page.html');
    const page = output.page;
    const comp2_1 = page.dom.findChildTag(tag => tag.tagName === 'div' && tag.getAttribute('class') === 'comp2' && tag.getAttribute('id') === '1');
    const comp2_2 = page.dom.findChildTag(tag => tag.tagName === 'div' && tag.getAttribute('class') === 'comp2' && tag.getAttribute('id') === '2');
    const comp2_3 = page.dom.findChildTag(tag => tag.tagName === 'div' && tag.getAttribute('class') === 'comp2' && tag.getAttribute('id') === '3');
    const comp2_4 = page.dom.findChildTag(tag => tag.tagName === 'div' && tag.getAttribute('class') === 'comp2' && tag.getAttribute('id') === '4');

    // validate
    t.truthy(comp2_1);
    t.is(comp2_1?.getAttribute('param'), 'value1');
    t.is(comp2_1?.getAttribute('value'), 'value');
    t.truthy(comp2_2);
    t.is(comp2_2?.getAttribute('param'), 'value2');
    t.is(comp2_2?.getAttribute('value'), 'value');
    t.truthy(comp2_3);
    t.is(comp2_3?.getAttribute('param'), 'value3');
    t.is(comp2_3?.getAttribute('value'), 'value');
    t.truthy(comp2_4);
    t.is(comp2_4?.getAttribute('param'), 'value4');
    t.is(comp2_4?.getAttribute('value'), 'value');
});

test('[endToEnd] Imported component compiles correctly', t => {
    // set up pipeline
    const pi = createRootPi();
    pi.setSourceHtml('comp.html', `
        <template>
            <m-import component src="comp2.html" as="imported-component" />
            <div class="comp">
                <imported-component />
                <imported-component id="{{ 1 }}" />
            </div>
        </template>
        <script mode="class">
            return class Comp {
                constructor() {}
            }
        </script>
    `);
    pi.setSourceHtml('comp2.html', `
        <template>
            <div class="comp2" id="\${ $.id }"></div>
        </template>
        <script mode="class">
            return class Comp {
                constructor(scope) {
                    this.id = scope.id || 0;
                }
            }
        </script>
    `);
    const pipeline = new Pipeline(pi);

    // compile component
    const output = pipeline.compilePage('page.html');
    const page = output.page;
    const comp2_0 = page.dom.findChildTag(tag => tag.tagName === 'div' && tag.getAttribute('class') === 'comp2' && tag.getAttribute('id') === "0");
    const comp2_1 = page.dom.findChildTag(tag => tag.tagName === 'div' && tag.getAttribute('class') === 'comp2' && tag.getAttribute('id') === "1");

    // validate
    t.truthy(comp2_0);
    t.truthy(comp2_1);
});
import test from 'ava';
import { Pipeline, BasicHtmlFormatter } from '../../lib/index';
import { MemoryPipelineInterface } from '../_mocks/memoryPipelineInterface';


function createRootPi(): MemoryPipelineInterface {
    const pi = new MemoryPipelineInterface();
    pi.htmlSource.set('page.html', '<!DOCTYPE html><html><head><title>Fragment Tests</title></head><body><m-fragment src="frag1.html" /></body></html>');

    return pi;
}

test('[endToEnd] Basic fragment compiles correctly', t => {
    // set up pipeline
    const pi = createRootPi();
    pi.htmlSource.set('frag1.html', '<div class="frag1"></div>');
    const pipeline = new Pipeline(pi);

    // compile fragment
    const page = pipeline.compilePage('page.html');
    const div = page.dom.findChildTag(tag => tag.tagName === 'div');

    // validate
    t.truthy(div);
    t.is(div?.getAttribute('class'), 'frag1');
});

test('[endToEnd] Nested fragments compiles correctly', t => {
    // set up pipeline
    const pi = createRootPi();
    pi.htmlSource.set('frag1.html', `
        <div class="frag1">
            <m-fragment src="frag2.html" />
        </div>
    `);
    pi.htmlSource.set('frag2.html', `
        <div class="frag2"></div>
    `);
    const pipeline = new Pipeline(pi);

    // compile fragment
    const page = pipeline.compilePage('page.html');
    const frag1 = page.dom.findChildTag(tag => tag.tagName === 'div' && tag.getAttribute('class') === 'frag1');
    const frag2 = page.dom.findChildTag(tag => tag.tagName === 'div' && tag.getAttribute('class') === 'frag2');

    // validate
    t.truthy(frag1);
    t.truthy(frag2);
});

test('[endToEnd] Fragment params compile correctly', t => {
    // set up pipeline
    const pi = createRootPi();
    pi.htmlSource.set('frag1.html', `
        <div class="frag1">
            <m-fragment src="frag2.html" param1="value1" param2="\${ 'value2' }" param3="{{ 'value3' }}"/>
        </div>
    `);
    pi.htmlSource.set('frag2.html', `
        <div class="frag2" param1="{{ $.param1 }}" param2="{{ $.param2 }}" param3="{{ $.param3 }}">
        </div>
    `);
    const pipeline = new Pipeline(pi);

    // compile fragment
    const page = pipeline.compilePage('page.html');
    const frag2 = page.dom.findChildTag(tag => tag.tagName === 'div' && tag.getAttribute('class') === 'frag2');

    // validate
    t.truthy(frag2);
    t.is(frag2?.getAttribute('param1'), 'value1', 'Raw parameters are preserved');
    t.is(frag2?.getAttribute('param2'), 'value2', 'Template text parameters are compiled');
    t.is(frag2?.getAttribute('param3'), 'value3', 'Handlebars parameters are compiled');
});

test('[endToEnd] Fragment compile to correct DOM', t => {
    // set up pipeline
    const pi = createRootPi();
    pi.htmlSource.set('frag1.html', `
        <div class="frag1">
            <m-fragment src="frag2.html" />
        </div>
    `);
    pi.htmlSource.set('frag2.html', `
        <div class="frag2"></div>
    `);
    const htmlFormatter = new BasicHtmlFormatter(false);
    const pipeline = new Pipeline(pi, htmlFormatter);

    // compile fragment
    pipeline.compilePage('page.html');
    const html = pi.htmlDestination.get('page.html');

    // validate
    t.is(html, '<!DOCTYPE html><html><head><title>Fragment Tests</title></head><body><div class="frag1"><div class="frag2"></div></div></body></html>');
});

test('[endToEnd] Repeated fragment usages have correct scope', t => {
    // set up pipeline
    const pi = createRootPi();
    pi.htmlSource.set('frag1.html', `
        <div class="comp1">
            <m-fragment src="frag2.html" id="1" param="value1" value="value" />
            <m-fragment src="frag2.html" id="2" param="value2" value="value" />
            <m-fragment src="frag2.html" id="3" param="value3" value="value" />
            <m-fragment src="frag2.html" id="4" param="value4" value="value" />
        </div>
    `);
    pi.htmlSource.set('frag2.html', `
        <div class="frag2" id="{{ $.id }}" param="{{ $.param }}" value="{{ $.value }}"></div>
    `);
    const pipeline = new Pipeline(pi);

    // compile fragment
    const page = pipeline.compilePage('page.html');
    const frag2_1 = page.dom.findChildTag(tag => tag.tagName === 'div' && tag.getAttribute('class') === 'frag2' && tag.getAttribute('id') === '1');
    const frag2_2 = page.dom.findChildTag(tag => tag.tagName === 'div' && tag.getAttribute('class') === 'frag2' && tag.getAttribute('id') === '2');
    const frag2_3 = page.dom.findChildTag(tag => tag.tagName === 'div' && tag.getAttribute('class') === 'frag2' && tag.getAttribute('id') === '3');
    const frag2_4 = page.dom.findChildTag(tag => tag.tagName === 'div' && tag.getAttribute('class') === 'frag2' && tag.getAttribute('id') === '4');

    // validate
    t.truthy(frag2_1);
    t.is(frag2_1?.getAttribute('param'), 'value1');
    t.is(frag2_1?.getAttribute('value'), 'value');
    t.truthy(frag2_2);
    t.is(frag2_2?.getAttribute('param'), 'value2');
    t.is(frag2_2?.getAttribute('value'), 'value');
    t.truthy(frag2_3);
    t.is(frag2_3?.getAttribute('param'), 'value3');
    t.is(frag2_3?.getAttribute('value'), 'value');
    t.truthy(frag2_4);
    t.is(frag2_4?.getAttribute('param'), 'value4');
    t.is(frag2_4?.getAttribute('value'), 'value');
});

test('[endToEnd] Fragment slots correctly', t => {
    // set up pipeline
    const pi = createRootPi();
    pi.htmlSource.set('frag1.html', `
        <div class="frag1">
            <m-fragment src="frag2.html" />
            <m-fragment src="frag2.html">
                <div>1</div>
            </m-fragment>
            <m-fragment src="frag2.html">
                <m-content>
                    <div>2</div>
                </m-content>
            </m-fragment>
            <m-fragment src="frag2.html">
                <m-content slot="[default]">
                    <div>3</div>
                </m-content>
            </m-fragment>
            <m-fragment src="frag2.html">
                <m-content>
                    <div>4.1</div>
                </m-content>
                <m-content slot="slot1">
                    <div>4.2</div>
                </m-content>
            </m-fragment>
            <m-fragment src="frag2.html">
                <div>5.1</div>
                <m-content slot="slot1">
                    <div>5.2</div>
                </m-content>
            </m-fragment>
        </div>
    `);
    pi.htmlSource.set('frag2.html', `
        <div class="frag2">
            <div class="[default]">
                <m-slot />
            </div>
            <div class="slot1">
                <m-slot slot="slot1" />
            </div>
        </div>
    `);
    const htmlFormatter = new BasicHtmlFormatter(false);
    const pipeline = new Pipeline(pi, htmlFormatter);

    // compile fragment
    pipeline.compilePage('page.html');
    const html = pi.htmlDestination.get('page.html');

    // validate
    t.is(html, '<!DOCTYPE html><html><head><title>Fragment Tests</title></head><body><div class="frag1"><div class="frag2"><div class="[default]"></div><div class="slot1"></div></div><div class="frag2"><div class="[default]"><div>1</div></div><div class="slot1"></div></div><div class="frag2"><div class="[default]"><div>2</div></div><div class="slot1"></div></div><div class="frag2"><div class="[default]"><div>3</div></div><div class="slot1"></div></div><div class="frag2"><div class="[default]"><div>4.1</div></div><div class="slot1"><div>4.2</div></div></div><div class="frag2"><div class="[default]"><div>5.1</div></div><div class="slot1"><div>5.2</div></div></div></div></body></html>');
});
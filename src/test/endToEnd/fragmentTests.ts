import test from 'ava';
import { Pipeline, BasicHtmlFormatter } from '../../lib';
import { MemoryPipelineInterface } from '../_mocks/memoryPipelineInterface';
import { compareFragmentMacro } from '../_util/htmlCompare';


function createRootPi(): MemoryPipelineInterface {
    const pi = new MemoryPipelineInterface();
    pi.setSourceHtml('page.html', '<!DOCTYPE html><html><head><title>Fragment Tests</title></head><body><m-fragment src="frag1.html" /></body></html>');

    return pi;
}

test('[endToEnd] Basic fragment compiles correctly', t => {
    // set up pipeline
    const pi = createRootPi();
    pi.setSourceHtml('frag1.html', '<div class="frag1"></div>');
    const pipeline = new Pipeline(pi);

    // compile fragment
    const output = pipeline.compilePage('page.html');
    const page = output.page;
    const div = page.dom.findChildTagByTagName('div');

    // validate
    t.truthy(div);
    t.is(div?.getAttribute('class'), 'frag1');
});

test('[endToEnd] Nested fragments compiles correctly', t => {
    // set up pipeline
    const pi = createRootPi();
    pi.setSourceHtml('frag1.html', `
        <div class="frag1">
            <m-fragment src="frag2.html" />
        </div>
    `);
    pi.setSourceHtml('frag2.html', `
        <div class="frag2"></div>
    `);
    const pipeline = new Pipeline(pi);

    // compile fragment
    const output = pipeline.compilePage('page.html');
    const page = output.page;
    const frag1 = page.dom.findChildTag(tag => tag.tagName === 'div' && tag.getAttribute('class') === 'frag1');
    const frag2 = page.dom.findChildTag(tag => tag.tagName === 'div' && tag.getAttribute('class') === 'frag2');

    // validate
    t.truthy(frag1);
    t.truthy(frag2);
});

test('[endToEnd] Fragment params compile correctly', t => {
    // set up pipeline
    const pi = createRootPi();
    pi.setSourceHtml('frag1.html', `
        <div class="frag1">
            <m-fragment src="frag2.html" param1="value1" param2="\${ 'value2' }" param3="{{ 'value3' }}"/>
        </div>
    `);
    pi.setSourceHtml('frag2.html', `
        <div class="frag2" param1="{{ $.param1 }}" param2="{{ $.param2 }}" param3="{{ $.param3 }}">
        </div>
    `);
    const pipeline = new Pipeline(pi);

    // compile fragment
    const output = pipeline.compilePage('page.html');
    const page = output.page;
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
    pi.setSourceHtml('frag1.html', `
        <div class="frag1">
            <m-fragment src="frag2.html" />
        </div>
    `);
    pi.setSourceHtml('frag2.html', `
        <div class="frag2"></div>
    `);
    const htmlFormatter = new BasicHtmlFormatter(false);
    const pipeline = new Pipeline(pi, htmlFormatter);

    // compile fragment
    const output = pipeline.compilePage('page.html');

    // validate
    t.is(output.html, '<!DOCTYPE html><html><head><title>Fragment Tests</title></head><body><div class="frag1"><div class="frag2"></div></div></body></html>');
});

test('[endToEnd] Repeated fragment usages have correct scope', t => {
    // set up pipeline
    const pi = createRootPi();
    pi.setSourceHtml('frag1.html', `
        <div class="comp1">
            <m-fragment src="frag2.html" id="1" param="value1" value="value" />
            <m-fragment src="frag2.html" id="2" param="value2" value="value" />
            <m-fragment src="frag2.html" id="3" param="value3" value="value" />
            <m-fragment src="frag2.html" id="4" param="value4" value="value" />
        </div>
    `);
    pi.setSourceHtml('frag2.html', `
        <div class="frag2" id="{{ $.id }}" param="{{ $.param }}" value="{{ $.value }}"></div>
    `);
    const pipeline = new Pipeline(pi);

    // compile fragment
    const output = pipeline.compilePage('page.html');
    const page = output.page;
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

test('[endToEnd] Fragment slots are filled correctly', t => {
    // set up pipeline
    const pi = createRootPi();
    pi.setSourceHtml('frag1.html', `
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
    pi.setSourceHtml('frag2.html', `
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
    const output = pipeline.compilePage('page.html');

    // validate
    t.is(output.html, '<!DOCTYPE html><html><head><title>Fragment Tests</title></head><body><div class="frag1"><div class="frag2"><div class="[default]"></div><div class="slot1"></div></div><div class="frag2"><div class="[default]"><div>1</div></div><div class="slot1"></div></div><div class="frag2"><div class="[default]"><div>2</div></div><div class="slot1"></div></div><div class="frag2"><div class="[default]"><div>3</div></div><div class="slot1"></div></div><div class="frag2"><div class="[default]"><div>4.1</div></div><div class="slot1"><div>4.2</div></div></div><div class="frag2"><div class="[default]"><div>5.1</div></div><div class="slot1"><div>5.2</div></div></div></div></body></html>');
});

test('[endToEnd] Fragment slot placeholder content is left when slot is unused', t => {
    // set up pipeline
    const pi = createRootPi();
    pi.setSourceHtml('frag1.html', `
        <div>
            <m-fragment src="frag2.html" />
            <m-fragment src="frag2.html">filled</m-fragment>
            <m-fragment src="frag3.html" />
            <m-fragment src="frag3.html">
                <m-content slot="named">filled</m-content>
            </m-fragment>
        </div>
    `);
    pi.setSourceHtml('frag2.html', `
        <div>
            <m-slot>empty</m-slot>
        </div>
    `);
    pi.setSourceHtml('frag3.html', `
        <div>
            <div class="named">
                <m-slot slot="named">empty</m-slot>
            </div>
        </div>
    `);
    const htmlFormatter = new BasicHtmlFormatter(false);
    const pipeline = new Pipeline(pi, htmlFormatter);

    // compile fragment
    const output = pipeline.compilePage('page.html');

    // validate
    t.is(output.html, '<!DOCTYPE html><html><head><title>Fragment Tests</title></head><body><div><div>empty</div><div>filled</div><div><div class="named">empty</div></div><div><div class="named">filled</div></div></div></body></html>');
});

test('[endToEnd] Imported fragment compiles correctly', t => {
    // set up pipeline
    const pi = createRootPi();
    pi.setSourceHtml('frag1.html', `
        <div class="frag1">
            <m-import fragment src="frag2.html" as="imported-fragment" />

            <imported-fragment count="1"/>
            <imported-fragment count="{{ 2 }}"/>
            <imported-fragment count="{{ 2 }}"/>
            <imported-fragment count="\${ 3 }"/>
            <imported-fragment count="\${ 3 }"/>
            <imported-fragment count="\${ 3 }"/>
        </div>
    `);
    pi.setSourceHtml('frag2.html', `
        <div class="frag2" count="\${ $.count }"></div>
    `);
    const pipeline = new Pipeline(pi);

    // compile fragment
    const output = pipeline.compilePage('page.html');
    const page = output.page;
    const frag2count1s = page.dom.findChildTags(tag => tag.getAttribute('class') === 'frag2' && tag.getAttribute('count') === '1');
    const frag2count2s = page.dom.findChildTags(tag => tag.getAttribute('class') === 'frag2' && tag.getAttribute('count') === '2');
    const frag2count3s = page.dom.findChildTags(tag => tag.getAttribute('class') === 'frag2' && tag.getAttribute('count') === '3');

    // validate
    t.is(frag2count1s.length, 1);
    t.is(frag2count2s.length, 2);
    t.is(frag2count3s.length, 3);
});

test('[endToEnd] Nested fragment slot content is placed correctly', t => {
    // set up pipeline
    const pi = createRootPi();
    pi.setSourceHtml('frag1.html', `
        <m-var localval="frag1" />
        <div class="frag1">
            <m-fragment src="frag2.html">
                <test-div expected="frag1" actual="{{ $.localval }}" />
                <m-fragment src="frag2.html">
                    <test-div expected="frag1" actual="{{ $.localval }}" />
                </m-fragment>
                <test-div expected="frag1" actual="{{ $.localval }}" />
            </m-fragment>
        </div>
    `);
    pi.setSourceHtml('frag2.html', `
        <m-var localval="frag2" />
        <div class="frag2">
            <test-div expected="frag2" actual="{{ $.localval }}" />
            <m-slot />
            <test-div expected="frag2" actual="{{ $.localval }}" />
        </div>
    `);
    const htmlFormatter = new BasicHtmlFormatter(false);
    const pipeline = new Pipeline(pi, htmlFormatter);

    // compile fragment
    const output = pipeline.compilePage('page.html');

    // validate
    t.is(output.html, '<!DOCTYPE html><html><head><title>Fragment Tests</title></head><body><div class="frag1"><div class="frag2"><test-div expected="frag2" actual="frag2"></test-div><test-div expected="frag1" actual="frag1"></test-div><div class="frag2"><test-div expected="frag2" actual="frag2"></test-div><test-div expected="frag1" actual="frag1"></test-div><test-div expected="frag2" actual="frag2"></test-div></div><test-div expected="frag1" actual="frag1"></test-div><test-div expected="frag2" actual="frag2"></test-div></div></div></body></html>');
});

test('[endToEnd] Fragment params are passed raw, not as strings', compareFragmentMacro,
`<m-fragment src="child.html" number="{{ 123 }}" boolean="{{ true }}" />`,
'true,true',
[[ 'child.html',
    `\${ $.number === 123 },\${ $.boolean === true }`
]]);
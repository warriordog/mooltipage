import test from 'ava';
import { compareFragmentMacro } from '../../_util/htmlCompare';

test('Basic fragment compiles correctly', compareFragmentMacro, '<div class="frag1"></div>', '<div class="frag1"></div>');

test('Nested fragments compile correctly', compareFragmentMacro,
`
    <div class="frag1">
        <m-fragment src="frag2.html" />
    </div>
`, '<div class="frag1"><div class="frag2"></div></div>',
[['frag2.html', '<div class="frag2"></div>']]);

test('Fragment params compile correctly', compareFragmentMacro,
`
<div class="frag1">
    <m-fragment src="frag2.html" param1="value1" param2="\${ 'value2' }" param3="{{ 'value3' }}"/>
</div>
`, '<div class="frag1"><div class="frag2" param1="value1" param2="value2" param3="value3"></div></div>',
[['frag2.html', '<div class="frag2" param1="{{ $.param1 }}" param2="{{ $.param2 }}" param3="{{ $.param3 }}">']]);

test('Repeated fragment usages have correct scope', compareFragmentMacro,
`
    <div class="comp1">
        <m-fragment src="frag2.html" id="1" param="value1" value="value" />
        <m-fragment src="frag2.html" id="2" param="value2" value="value" />
    </div>
`, '<div class="comp1"><div class="frag2" id="1" param="value1" value="value"></div><div class="frag2" id="2" param="value2" value="value"></div></div>',
[['frag2.html', '<div class="frag2" id="{{ $.id }}" param="{{ $.param }}" value="{{ $.value }}"></div>']]);

test('Fragment slots are filled correctly', compareFragmentMacro,
`
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
`, '<div class="frag1"><div class="frag2"><div class="[default]"></div><div class="slot1"></div></div><div class="frag2"><div class="[default]"><div>1</div></div><div class="slot1"></div></div><div class="frag2"><div class="[default]"><div>2</div></div><div class="slot1"></div></div><div class="frag2"><div class="[default]"><div>3</div></div><div class="slot1"></div></div><div class="frag2"><div class="[default]"><div>4.1</div></div><div class="slot1"><div>4.2</div></div></div><div class="frag2"><div class="[default]"><div>5.1</div></div><div class="slot1"><div>5.2</div></div></div></div>',
    [['frag2.html', `
<div class="frag2">
    <div class="[default]">
        <m-slot />
    </div>
    <div class="slot1">
        <m-slot slot="slot1" />
    </div>
</div>`]]);

test('Fragment slot placeholder content is left when slot is unused', compareFragmentMacro,
`
<div>
    <m-fragment src="frag2.html" />
    <m-fragment src="frag2.html">filled</m-fragment>
    <m-fragment src="frag3.html" />
    <m-fragment src="frag3.html">
        <m-content slot="named">filled</m-content>
    </m-fragment>
</div>
`, '<div><div>empty</div><div>filled</div><div><div class="named">empty</div></div><div><div class="named">filled</div></div></div>',
[
    [
        'frag2.html', `
        <div>
            <m-slot>empty</m-slot>
        </div>
    `], [
        'frag3.html', `
        <div>
            <div class="named">
                <m-slot slot="named">empty</m-slot>
            </div>
        </div>`
    ]
]);

test('Vars work inside fragment slot contents', compareFragmentMacro,
`<m-fragment src="child.html">
    <m-var test="testValue" />
    <m-scope test2="another">
        <div test="\${ $.test }" test2="\${ $.test2 }"></div>
    </m-scope>
</m-fragment>`,
'<div test="testValue" test2="another"></div>',
[['child.html', `
    <m-var test="bad" test2="bad" />
    <m-slot />
`]]);

test('Vars work inside fragment default slot contents', compareFragmentMacro,
`<m-var test="bad" test2="bad" />
<m-fragment src="child.html" />`,
'<div test="testValue" test2="another"></div>',
[['child.html', `
    <m-slot>
        <m-var test="testValue" />
        <m-scope test2="another">
            <div test="\${ $.test }" test2="\${ $.test2 }"></div>
        </m-scope>
    </m-slot>
`]]);

test('Imported basic fragment compiles correctly', compareFragmentMacro,
`
    <div class="frag1">
        <m-import fragment src="frag2.html" as="imported-fragment" />
    
        <imported-fragment />
        <imported-fragment />
    </div>
`, '<div class="frag1"><div class="frag2"></div><div class="frag2"></div></div>',
[['frag2.html', `<div class="frag2"></div>`]]);

test('Imported fragment w/ params compiles correctly', compareFragmentMacro,
    `
    <div class="frag1">
        <m-import fragment src="frag2.html" as="imported-fragment" />

        <imported-fragment count="1"/>
        <imported-fragment count="{{ 2 }}"/>
        <imported-fragment count="\${ 3 }"/>
    </div>
`, '<div class="frag1"><div class="frag2" count="1"></div><div class="frag2" count="2"></div><div class="frag2" count="3"></div></div>',
[['frag2.html', `<div class="frag2" count="\${ $.count }"></div>`]]);

test('Nested fragment slot content is placed correctly', compareFragmentMacro,
    `
    <m-var local-val="frag1" />
    <div class="frag1">
        <m-fragment src="frag2.html">
            <test-div expected="frag1" actual="{{ $.localVal }}" />
            <m-fragment src="frag2.html">
                <test-div expected="frag1" actual="{{ $.localVal }}" />
            </m-fragment>
            <test-div expected="frag1" actual="{{ $.localVal }}" />
        </m-fragment>
    </div>
`, '<div class="frag1"><div class="frag2"><test-div expected="frag2" actual="frag2"></test-div><test-div expected="frag1" actual="frag1"></test-div><div class="frag2"><test-div expected="frag2" actual="frag2"></test-div><test-div expected="frag1" actual="frag1"></test-div><test-div expected="frag2" actual="frag2"></test-div></div><test-div expected="frag1" actual="frag1"></test-div><test-div expected="frag2" actual="frag2"></test-div></div></div>',
    [['frag2.html', `
        <m-var local-val="frag2" />
        <div class="frag2">
            <test-div expected="frag2" actual="{{ $.localVal }}" />
            <m-slot />
            <test-div expected="frag2" actual="{{ $.localVal }}" />
        </div>
    `]]);

test('Fragment params are passed raw, not as strings', compareFragmentMacro,
`<m-fragment src="child.html" number="{{ 123 }}" boolean="{{ true }}" />`,
'true,true',
[[ 'child.html',
    `\${ $.number === 123 },\${ $.boolean === true }`
]]);

test('Fragment params are case-converted', compareFragmentMacro,
    `<m-fragment src="child.html" number-param="{{ 123 }}" boolean-param="{{ true }}" string-param="string" />`,
    'true,true,true',
    [[ 'child.html',
        `\${ $.numberParam === 123 },\${ $.booleanParam === true },\${ $.stringParam === 'string' }`
    ]]);

test('Resources are resolved relative to current fragment', compareFragmentMacro,
`<style compiled src="style.css"></style><m-fragment src="child/frag.html" />`,
`<style>.root {}</style><style>.child {}</style><style>.inner {}</style>`,
[
    [ 'style.css', '.root {}'],
    [ 'child/frag.html', '<style compiled src="style.css"></style><m-fragment src="child/frag.html" />'],
    [ 'child/style.css', '.child {}'],
    [ 'child/child/frag.html', '<style compiled src="style.css"></style>'],
    [ 'child/child/style.css', '.inner {}']
]);
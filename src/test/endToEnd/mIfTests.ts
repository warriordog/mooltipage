import test from 'ava';
import { compareFragmentMacro } from '../_util/htmlCompare';

test('m-if works at the root context', compareFragmentMacro, `
    <m-if ?="{{ true }}">
        <div class="good"></div>
    </m-if>
    <m-if ?="{{ false }}">
        <div class="bad"></div>
    </m-if>
`, '<div class="good"></div>');

test('m-if works with truthy and falsy values', compareFragmentMacro, `
    <m-if ?="{{ 1 }}">
        <div class="good"></div>
    </m-if>
    <m-if ?="{{ 0 }}">
        <div class="bad"></div>
    </m-if>
`, '<div class="good"></div>');

test('m-if works with vars', compareFragmentMacro,
`
    <m-var test="{{ true }}" />
    <m-if ?="{{ $.test }}">
        <div class="good"></div>
    </m-if>
    <m-if ?="{{ !$.test }}">
        <div class="bad"></div>
    </m-if>`,
'<div class="good"></div>');

test('m-if works when nested', compareFragmentMacro, `
<m-if ?="{{ true }}">
    <m-if ?="{{ true }}">
        <div class="good"></div>
    </m-if>
    <m-if ?="{{ false }}">
        <div class="bad"></div>
    </m-if>
</m-if>
<m-if ?="{{ false }}">
    <div class="bad"></div>
</m-if>`, '<div class="good"></div>');

test('m-if respects scopes', compareFragmentMacro,
`<m-var test="{{ true }}" />
<m-scope test="{{ false }}">
    <m-if ?="{{ $.test }}">bad</m-if>
    <m-if ?="{{ !$.test }}">good</m-if>
</m-scope>`,
'good');

test('m-if works in a fragment', compareFragmentMacro,
`<m-fragment src="child.html" test="{{ true }}" />`,
'good',
[['child.html', `
    <m-if ?="{{ $.test }}">good</m-if>
    <m-if ?="{{ !$.test }}">bad</m-if>
`]]);

test('m-if works in a component', compareFragmentMacro,
`<m-fragment src="comp.html" />`,
'good',
[['comp.html', `
<script compiled>
    this.test = true;
</script>
    <m-if ?="{{ $.test }}">good</m-if>
    <m-if ?="{{ !$.test }}">bad</m-if>
`]]);

test('correct conditional branch is taken when there are multiple options', compareFragmentMacro,
`<m-if ?="{{ true }}">
    <good />
</m-if>
<m-else>
    <bad />
</m-else>

<m-if ?="{{ false }}">
    <bad />
</m-if>
<m-else>
    <good />
</m-else>

<m-if ?="{{ false }}">
    <bad1 />
</m-if>
<m-else-if ?="{{ true }}">
    <good />
</m-else-if>
<m-else>
    <bad2 />
</m-else>

<m-if ?="{{ false }}">
    <bad1 />
</m-if>
<m-else-if ?="{{ false }}">
    <bad2 />
</m-else-if>

<m-if ?="{{ false }}">
    <bad1 />
</m-if>
<m-else-if ?="{{ false }}">
    <bad2 />
</m-else-if>
<m-else-if ?="{{ true }}">
    <good />
</m-else-if>
<m-else-if ?="{{ false }}">
    <bad3 />
</m-else-if>
<m-else>
    <bad4 />
</m-else>
`, '<good></good><good></good><good></good><good></good>');

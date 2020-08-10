import test from 'ava';
import { compareFragmentMacro } from '../_util/htmlCompare';

test('m-for for...of compiles correctly', compareFragmentMacro,
`<div>
    <m-for of="{{ undefined }}" var="val">
        <bad value="\${ $.val }" />
    </m-for>
    <m-for of="{{ [] }}" var="val">
        <bad value="\${ $.val }" />
    </m-for>
    <m-for of="{{ [ 1 ] }}" var="val" index="i">
        <good value="\${ $.val }" index="\${ $.i }" />
    </m-for>
    <m-for of="{{ [ 1, 2, 3] }}" var="val" index="i">
        <good value="\${ $.val }" index="\${ $.i }" />
    </m-for>
</div>`,
'<div><good value="1" index="0"></good><good value="1" index="0"></good><good value="2" index="1"></good><good value="3" index="2"></good></div>');

test('m-for for...in compiles correctly', compareFragmentMacro,
`<div>
    <m-for in="{{ undefined }}" var="val">
        <bad value="\${ $.val }" />
    </m-for>
    <m-for in="{{ {} }}" var="val">
        <bad value="\${ $.val }" />
    </m-for>
    <m-for in="{{ { 'a': 'A' } }}" var="val" index="i">
        <good value="\${ $.val }" index="\${ $.i }" />
    </m-for>
    <m-for in="{{ { 'a': 'A', 'b': 'B', 'c': 'C' } }}" var="val" index="i">
        <good value="\${ $.val }" index="\${ $.i }" />
    </m-for>
</div>`,
'<div><good value="a" index="0"></good><good value="a" index="0"></good><good value="b" index="1"></good><good value="c" index="2"></good></div>'
);

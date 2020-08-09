import test from 'ava';
import { compareFragmentMacro } from '../_util/htmlCompare';

test('Duplicate style nodes are culled', compareFragmentMacro,
`
    <style>.class1 { }</style>
    <style>.class1 { }</style>
    <style>.div { }</style>
    <style>.class1 { }</style>
    <style>.div { }</style>`
,`<style>.class1 { }</style><style>.div { }</style>`);

test('Duplicate style nodes with mixed compiled / not compiled are culled', compareFragmentMacro,
`
    <style>.class1 { }</style>
    <style compiled>.class1 { }</style>
    <style compiled>.div { }</style>
    <style>.class1 { }</style>
    <style>.div { }</style>`
,`<style>.class1 { }</style><style>.div { }</style>`);

test('Duplicate style nodes with different padding are culled', compareFragmentMacro,
`
    <style>.class1 { }</style>
    <style>     .class1 { }    </style>
    <style>.div { }</style>
    <style>
        .div { }
    </style>`
,`<style>.class1 { }</style><style>.div { }</style>`);

test('Duplicate link nodes are culled', compareFragmentMacro,
`
    <link href="foo.css" />
    <link href="foo.js" />
    <link href="foo.css" />
    <link href="foo.js" />
`,`<link href="foo.css" /><link href="foo.js" />`);
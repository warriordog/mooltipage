import test from 'ava';
import {interpolateEvalTemplateString} from '../../lib/pipeline/module/htmlCompiler';

test('interpolateEvalTemplateString handles normal templates', async t => {
    const t1 = await interpolateEvalTemplateString`Hello, ${ 'world' }!`;
    t.is(t1, 'Hello, world!');

    const t2 = await interpolateEvalTemplateString`${ 'test' }`;
    t.is(t2, 'test');

    const t3 = await interpolateEvalTemplateString`Test`;
    t.is(t3, 'Test');

    const t4 = await interpolateEvalTemplateString`${ 'Hello' }, ${ 'world!' }`;
    t.is(t4, 'Hello, world!');

    const t5 = await interpolateEvalTemplateString`1${ 2 }${ 3 }${ 4 }5${ 6 }7`;
    t.is(t5, '1234567');
});

test('interpolateEvalTemplateString handles async templates', async t => {
    // noinspection All
    const t1 = await interpolateEvalTemplateString`Hello, ${ Promise.resolve('world') }!`;
    t.is(t1, 'Hello, world!');

    // noinspection All
    const t4 = await interpolateEvalTemplateString`${ Promise.resolve('Hello') }, ${ 'world!' }`;
    t.is(t4, 'Hello, world!');

    // noinspection All
    const t5 = await interpolateEvalTemplateString`1${ 2 }${ Promise.resolve(3) }${ 4 }5${ 6 }7`;
    t.is(t5, '1234567');
});
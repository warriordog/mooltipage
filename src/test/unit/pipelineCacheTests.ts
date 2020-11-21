import test from 'ava';
import {DocumentNode, EvalFunction, Fragment} from '../../lib';
import {StandardPipelineCache} from '../../lib/pipeline/pipelineCache';

test('PipelineCache.fragmentCache works correctly', t => {
    const pc = new StandardPipelineCache();

    // setting values
    const value1: Fragment = { path: 'key1', dom: new DocumentNode() };
    const value2: Fragment = { path: 'key2', dom: new DocumentNode() };
    pc.fragmentCache.store('key1', value1);
    pc.fragmentCache.store('key2', value2);

    // checking for existing
    t.true(pc.fragmentCache.has('key1'));
    t.true(pc.fragmentCache.has('key2'));

    // checking for non-existing
    t.false(pc.fragmentCache.has('key3'));

    // getting existing
    t.is(pc.fragmentCache.get('key1'), value1);
    t.is(pc.fragmentCache.get('key2'), value2);

    // getting non existing
    t.throws(() => pc.fragmentCache.get('key3'));

    // overwriting
    const value1b: Fragment = { path: 'key1', dom: new DocumentNode() };
    pc.fragmentCache.store('key1', value1b);
    t.is(pc.fragmentCache.get('key1'), value1b);
    t.not(pc.fragmentCache.get('key1'), value1);

    // deleting
    pc.fragmentCache.remove('key1');
    t.false(pc.fragmentCache.has('key1'));
    t.throws(() => pc.fragmentCache.get('key1'));

    // clearing
    pc.fragmentCache.clear();
    t.false(pc.fragmentCache.has('key2'));
});

test('PipelineCache.expressionCache works correctly', t => {
    const pc = new StandardPipelineCache();

    // setting values
    const value1: EvalFunction<unknown> = () => undefined;
    const value2: EvalFunction<unknown> = () => undefined;
    pc.expressionCache.store('key1', value1);
    pc.expressionCache.store('key2', value2);

    // checking for existing
    t.true(pc.expressionCache.has('key1'));
    t.true(pc.expressionCache.has('key2'));

    // checking for non-existing
    t.false(pc.expressionCache.has('key3'));

    // getting existing
    t.is(pc.expressionCache.get('key1'), value1);
    t.is(pc.expressionCache.get('key2'), value2);

    // getting non existing
    t.throws(() => pc.expressionCache.get('key3'));

    // overwriting
    const value1b: EvalFunction<unknown> = () => undefined;
    pc.expressionCache.store('key1', value1b);
    t.is(pc.expressionCache.get('key1'), value1b);
    t.not(pc.expressionCache.get('key1'), value1);

    // deleting
    pc.expressionCache.remove('key1');
    t.false(pc.expressionCache.has('key1'));
    t.throws(() => pc.expressionCache.get('key1'));

    // clearing
    pc.expressionCache.clear();
    t.false(pc.expressionCache.has('key2'));
});

test('PipelineCache.scriptCache works correctly', t => {
    const pc = new StandardPipelineCache();

    // setting values
    const value1: EvalFunction<unknown> = () => undefined;
    const value2: EvalFunction<unknown> = () => undefined;
    pc.scriptCache.store('key1', value1);
    pc.scriptCache.store('key2', value2);

    // checking for existing
    t.true(pc.scriptCache.has('key1'));
    t.true(pc.scriptCache.has('key2'));

    // checking for non-existing
    t.false(pc.scriptCache.has('key3'));

    // getting existing
    t.is(pc.scriptCache.get('key1'), value1);
    t.is(pc.scriptCache.get('key2'), value2);

    // getting non existing
    t.throws(() => pc.scriptCache.get('key3'));

    // overwriting
    const value1b: EvalFunction<unknown> = () => undefined;
    pc.scriptCache.store('key1', value1b);
    t.is(pc.scriptCache.get('key1'), value1b);
    t.not(pc.scriptCache.get('key1'), value1);

    // deleting
    pc.scriptCache.remove('key1');
    t.false(pc.scriptCache.has('key1'));
    t.throws(() => pc.scriptCache.get('key1'));

    // clearing
    pc.scriptCache.clear();
    t.false(pc.scriptCache.has('key2'));
});

test('PipelineCache.createdResourceCache works correctly', t => {
    const pc = new StandardPipelineCache();

    // setting values
    const value1 = 'value1';
    const value2 = 'value2';
    pc.createdResourceCache.store('key1', value1);
    pc.createdResourceCache.store('key2', value2);

    // checking for existing
    t.true(pc.createdResourceCache.has('key1'));
    t.true(pc.createdResourceCache.has('key2'));

    // checking for non-existing
    t.false(pc.createdResourceCache.has('key3'));

    // getting existing
    t.is(pc.createdResourceCache.get('key1'), value1);
    t.is(pc.createdResourceCache.get('key2'), value2);

    // getting non existing
    t.throws(() => pc.createdResourceCache.get('key3'));

    // overwriting
    const value1b = 'value1b';
    pc.createdResourceCache.store('key1', value1b);
    t.is(pc.createdResourceCache.get('key1'), value1b);
    t.not(pc.createdResourceCache.get('key1'), value1);

    // deleting
    pc.createdResourceCache.remove('key1');
    t.false(pc.createdResourceCache.has('key1'));
    t.throws(() => pc.createdResourceCache.get('key1'));

    // clearing
    pc.createdResourceCache.clear();
    t.false(pc.createdResourceCache.has('key2'));
});

test('PipelineCache.clear() clears all caches', t => {
    const pc = new StandardPipelineCache();

    pc.fragmentCache.store('key1', { path: 'key1', dom: new DocumentNode() });
    pc.expressionCache.store('key1', () => undefined);
    pc.scriptCache.store('key1', () => undefined);
    pc.createdResourceCache.store('key1', 'value1');

    pc.clear();

    t.false(pc.fragmentCache.has('key1'));
    t.false(pc.expressionCache.has('key1'));
    t.false(pc.scriptCache.has('key1'));
    t.false(pc.createdResourceCache.has('key1'));
});
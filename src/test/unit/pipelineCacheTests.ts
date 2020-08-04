import test from 'ava';
import { DocumentNode, Fragment } from '../../lib';
import { PipelineCache } from '../../lib/pipeline/pipelineCache';
import { EvalContent } from '../../lib/pipeline/module/evalEngine';

/*
 * Fragment
 */

test('[unit] PipelineCache.hasFragment() returns true when object is cached', t => {
    const cache = new PipelineCache();

    cache.storeFragment({
        path: 'foo',
        dom: new DocumentNode()
    });

    t.true(cache.hasFragment('foo'));
});

test('[unit] PipelineCache.hasFragment() returns false when object is not cached', t => {
    const cache = new PipelineCache();

    t.false(cache.hasFragment('foo'));
});

test('[unit] PipelineCache.getFragment() returns cached object when present', t => {
    const cache = new PipelineCache();
    const fragment: Fragment = {
        path: 'foo',
        dom: new DocumentNode()
    };

    cache.storeFragment(fragment);

    t.is(cache.getFragment('foo'), fragment);
});

test('[unit] PipelineCache.getFragment() throws when object is not cached', t => {
    const cache = new PipelineCache();

    t.throws(() => cache.getFragment('foo'));
});

test('[unit] PipelineCache.storeFragment() can overwrite an existing entry', t => {
    const cache = new PipelineCache();
    const fragment1: Fragment = {
        path: 'foo',
        dom: new DocumentNode()
    };
    const fragment2: Fragment = {
        path: 'foo',
        dom: new DocumentNode()
    };

    cache.storeFragment(fragment1);
    cache.storeFragment(fragment2);

    t.is(cache.getFragment('foo'), fragment2);
});

/*
 * Expression
 */

test('[unit] PipelineCache.hasExpression() returns true when object is cached', t => {
    const cache = new PipelineCache();

    cache.storeExpression('foo', new EvalContent(() => 'foo'));

    t.true(cache.hasExpression('foo'));
});

test('[unit] PipelineCache.hasExpression() returns false when object is not cached', t => {
    const cache = new PipelineCache();

    t.false(cache.hasExpression('foo'));
});

test('[unit] PipelineCache.getExpression() returns cached object when present', t => {
    const cache = new PipelineCache();
    const expression = new EvalContent(() => 'foo');

    cache.storeExpression('foo', expression);

    t.is(cache.getExpression('foo'), expression);
});

test('[unit] PipelineCache.getExpression() throws when object is not cached', t => {
    const cache = new PipelineCache();

    t.throws(() => cache.getExpression('foo'));
});

test('[unit] PipelineCache.storeExpression() can overwrite an existing entry', t => {
    const cache = new PipelineCache();
    const expression1 = new EvalContent(() => 'foo');
    const expression2 = new EvalContent(() => 'foo');

    cache.storeExpression('foo', expression1);
    cache.storeExpression('foo', expression2);

    t.is(cache.getExpression('foo'), expression2);
});
/*
 * Script
 */

test('[unit] PipelineCache.hasScript() returns true when object is cached', t => {
    const cache = new PipelineCache();

    cache.storeScript('foo', new EvalContent(() => 'foo'));

    t.true(cache.hasScript('foo'));
});

test('[unit] PipelineCache.hasScript() returns false when object is not cached', t => {
    const cache = new PipelineCache();

    t.false(cache.hasScript('foo'));
});

test('[unit] PipelineCache.getScript() returns cached object when present', t => {
    const cache = new PipelineCache();
    const script = new EvalContent(() => 'foo');

    cache.storeScript('foo', script);

    t.is(cache.getScript('foo'), script);
});

test('[unit] PipelineCache.getScript() throws when object is not cached', t => {
    const cache = new PipelineCache();

    t.throws(() => cache.getScript('foo'));
});

test('[unit] PipelineCache.storeScript() can overwrite an existing entry', t => {
    const cache = new PipelineCache();
    const script1 = new EvalContent(() => 'foo');
    const script2 = new EvalContent(() => 'foo');

    cache.storeScript('foo', script1);
    cache.storeScript('foo', script2);

    t.is(cache.getScript('foo'), script2);
});
/*
 * ExternalScript
 */

test('[unit] PipelineCache.hasExternalScript() returns true when object is cached', t => {
    const cache = new PipelineCache();

    cache.storeExternalScript('foo', 'bar');

    t.true(cache.hasExternalScript('foo'));
});

test('[unit] PipelineCache.hasExternalScript() returns false when object is not cached', t => {
    const cache = new PipelineCache();

    t.false(cache.hasExternalScript('foo'));
});

test('[unit] PipelineCache.getExternalScript() returns cached object when present', t => {
    const cache = new PipelineCache();

    cache.storeExternalScript('foo', 'bar');

    t.is(cache.getExternalScript('foo'), 'bar');
});

test('[unit] PipelineCache.getExternalScript() throws when object is not cached', t => {
    const cache = new PipelineCache();

    t.throws(() => cache.getExternalScript('foo'));
});

test('[unit] PipelineCache.storeExternalScript() can overwrite an existing entry', t => {
    const cache = new PipelineCache();

    cache.storeExternalScript('foo', 'bar1');
    cache.storeExternalScript('foo', 'bar2');

    t.is(cache.getExternalScript('foo'), 'bar2');
});

/*
 * CreatedResource
 */

test('[unit] PipelineCache.hasCreatedResource() returns true when resource is cached', t => {
    const cache = new PipelineCache();

    cache.storeCreatedResource('hash', 'path');

    t.true(cache.hasCreatedResource('hash'));
});

test('[unit] PipelineCache.hasCreatedResource() returns false when resource is not cached', t => {
    const cache = new PipelineCache();

    t.false(cache.hasCreatedResource('hash'));
});

test('[unit] PipelineCache.getCreatedResource() returns cached resource when present', t => {
    const cache = new PipelineCache();

    cache.storeCreatedResource('hash', 'path');

    t.is(cache.getCreatedResource('hash'), 'path');
});

test('[unit] PipelineCache.getCreatedResource() throws when resource is not cached', t => {
    const cache = new PipelineCache();

    t.throws(() => cache.getCreatedResource('hash'));
});

test('[unit] PipelineCache.storeCreatedResource() can overwrite an existing entry', t => {
    const cache = new PipelineCache();

    cache.storeCreatedResource('hash', 'path1');
    cache.storeCreatedResource('hash', 'path2');

    t.is(cache.getCreatedResource('hash'), 'path2');
});

/*
 * General
 */

test('[unit] PipelineCache.clear() clears all caches', t => {
    const cache = new PipelineCache();

    cache.storeFragment({
        path: 'foo',
        dom: new DocumentNode()
    });
    cache.storeExpression('foo', new EvalContent(() => 'foo'));
    cache.storeCreatedResource('foo', 'foo');
    cache.storeScript('foo', new EvalContent<boolean>(() => true));
    cache.storeExternalScript('foo', 'true');
    
    cache.clear();

    t.false(cache.hasFragment('foo'));
    t.false(cache.hasExpression('foo'));
    t.false(cache.hasCreatedResource('foo'));
    t.false(cache.hasScript('foo'));
    t.false(cache.hasExternalScript('foo'));
});
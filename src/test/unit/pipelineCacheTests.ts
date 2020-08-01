import test from 'ava';
import { Component, ComponentTemplate, ComponentScript, ComponentScriptType } from '../../lib/pipeline/object/component';
import { DocumentNode, Fragment } from '../../lib';
import { EvalContentFunction } from '../../lib/pipeline/module/evalEngine';
import { PipelineCache } from '../../lib/pipeline/pipelineCache';

function createTestComponent(): Component {
    const template = new ComponentTemplate(new DocumentNode());
    const script = new ComponentScript(ComponentScriptType.FUNCTION, new EvalContentFunction(() => { return {} }))
    return new Component('foo', template, script);
}

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
 * Component
 */

test('[unit] PipelineCache.hasComponent() returns true when object is cached', t => {
    const cache = new PipelineCache();

    cache.storeComponent(createTestComponent());

    t.true(cache.hasComponent('foo'));
});

test('[unit] PipelineCache.hasComponent() returns false when object is not cached', t => {
    const cache = new PipelineCache();

    t.false(cache.hasComponent('foo'));
});

test('[unit] PipelineCache.getComponent() returns cached object when present', t => {
    const cache = new PipelineCache();
    const component = createTestComponent();

    cache.storeComponent(component);

    t.is(cache.getComponent('foo'), component);
});

test('[unit] PipelineCache.getComponent() throws when object is not cached', t => {
    const cache = new PipelineCache();

    t.throws(() => cache.getComponent('foo'));
});

test('[unit] PipelineCache.storeComponent() can overwrite an existing entry', t => {
    const cache = new PipelineCache();
    const component1 = createTestComponent();
    const component2 = createTestComponent();

    cache.storeComponent(component1);
    cache.storeComponent(component2);

    t.is(cache.getComponent('foo'), component2);
});
/*
 * Expression
 */

test('[unit] PipelineCache.hasExpression() returns true when object is cached', t => {
    const cache = new PipelineCache();

    cache.storeExpression('foo', new EvalContentFunction(() => 'foo'));

    t.true(cache.hasExpression('foo'));
});

test('[unit] PipelineCache.hasExpression() returns false when object is not cached', t => {
    const cache = new PipelineCache();

    t.false(cache.hasExpression('foo'));
});

test('[unit] PipelineCache.getExpression() returns cached object when present', t => {
    const cache = new PipelineCache();
    const expression = new EvalContentFunction(() => 'foo');

    cache.storeExpression('foo', expression);

    t.is(cache.getExpression('foo'), expression);
});

test('[unit] PipelineCache.getExpression() throws when object is not cached', t => {
    const cache = new PipelineCache();

    t.throws(() => cache.getExpression('foo'));
});

test('[unit] PipelineCache.storeExpression() can overwrite an existing entry', t => {
    const cache = new PipelineCache();
    const expression1 = new EvalContentFunction(() => 'foo');
    const expression2 = new EvalContentFunction(() => 'foo');

    cache.storeExpression('foo', expression1);
    cache.storeExpression('foo', expression2);

    t.is(cache.getExpression('foo'), expression2);
});
/*
 * Script
 */

test('[unit] PipelineCache.hasScript() returns true when object is cached', t => {
    const cache = new PipelineCache();

    cache.storeScript('foo', new EvalContentFunction(() => 'foo'));

    t.true(cache.hasScript('foo'));
});

test('[unit] PipelineCache.hasScript() returns false when object is not cached', t => {
    const cache = new PipelineCache();

    t.false(cache.hasScript('foo'));
});

test('[unit] PipelineCache.getScript() returns cached object when present', t => {
    const cache = new PipelineCache();
    const script = new EvalContentFunction(() => 'foo');

    cache.storeScript('foo', script);

    t.is(cache.getScript('foo'), script);
});

test('[unit] PipelineCache.getScript() throws when object is not cached', t => {
    const cache = new PipelineCache();

    t.throws(() => cache.getScript('foo'));
});

test('[unit] PipelineCache.storeScript() can overwrite an existing entry', t => {
    const cache = new PipelineCache();
    const script1 = new EvalContentFunction(() => 'foo');
    const script2 = new EvalContentFunction(() => 'foo');

    cache.storeScript('foo', script1);
    cache.storeScript('foo', script2);

    t.is(cache.getScript('foo'), script2);
});
/*
 * ExternalScript
 */

test('[unit] PipelineCache.hasExternalScript() returns true when object is cached', t => {
    const cache = new PipelineCache();

    cache.storeExternalScript('foo', new EvalContentFunction(() => 'foo'));

    t.true(cache.hasExternalScript('foo'));
});

test('[unit] PipelineCache.hasExternalScript() returns false when object is not cached', t => {
    const cache = new PipelineCache();

    t.false(cache.hasExternalScript('foo'));
});

test('[unit] PipelineCache.getExternalScript() returns cached object when present', t => {
    const cache = new PipelineCache();
    const externalScript = new EvalContentFunction(() => 'foo');

    cache.storeExternalScript('foo', externalScript);

    t.is(cache.getExternalScript('foo'), externalScript);
});

test('[unit] PipelineCache.getExternalScript() throws when object is not cached', t => {
    const cache = new PipelineCache();

    t.throws(() => cache.getExternalScript('foo'));
});

test('[unit] PipelineCache.storeExternalScript() can overwrite an existing entry', t => {
    const cache = new PipelineCache();
    const externalScript1 = new EvalContentFunction(() => 'foo');
    const externalScript2 = new EvalContentFunction(() => 'foo');

    cache.storeExternalScript('foo', externalScript1);
    cache.storeExternalScript('foo', externalScript2);

    t.is(cache.getExternalScript('foo'), externalScript2);
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
 * Tests for other script stuff
 */

test('[unit] PipelineCache.clear() clears all caches', t => {
    const cache = new PipelineCache();

    cache.storeFragment({
        path: 'foo',
        dom: new DocumentNode()
    });
    cache.storeComponent(createTestComponent());
    cache.storeExpression('foo', new EvalContentFunction(() => 'foo'));
    cache.storeCreatedResource('foo', 'foo');
    
    cache.clear();

    t.false(cache.hasFragment('foo'));
    t.false(cache.hasComponent('foo'));
    t.false(cache.hasExpression('foo'));
    t.false(cache.hasCreatedResource('foo'));
});
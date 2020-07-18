import test from 'ava';
import { PipelineCache, Fragment, DocumentNode, EvalContentFunction, Component, ComponentTemplate, ComponentScript, ComponentScriptType } from '../../lib';

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

    cache.storeFragment(new Fragment('foo', new DocumentNode()));

    t.true(cache.hasFragment('foo'));
});

test('[unit] PipelineCache.hasFragment() returns false when object is not cached', t => {
    const cache = new PipelineCache();

    t.false(cache.hasFragment('foo'));
});

test('[unit] PipelineCache.getFragment() returns cached object when present', t => {
    const cache = new PipelineCache();
    const fragment = new Fragment('foo', new DocumentNode());

    cache.storeFragment(fragment);

    t.is(cache.getFragment('foo'), fragment);
});

test('[unit] PipelineCache.getFragment() throws when object is not cached', t => {
    const cache = new PipelineCache();

    t.throws(() => cache.getFragment('foo'));
});

test('[unit] PipelineCache.storeFragment() can overwrite an existing entry', t => {
    const cache = new PipelineCache();
    const fragment1 = new Fragment('foo', new DocumentNode());
    const fragment2 = new Fragment('foo', new DocumentNode());

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
 * ScriptText
 */

test('[unit] PipelineCache.hasScriptText() returns true when object is cached', t => {
    const cache = new PipelineCache();

    cache.storeScriptText('foo', new EvalContentFunction(() => 'foo'));

    t.true(cache.hasScriptText('foo'));
});

test('[unit] PipelineCache.hasScriptText() returns false when object is not cached', t => {
    const cache = new PipelineCache();

    t.false(cache.hasScriptText('foo'));
});

test('[unit] PipelineCache.getScriptText() returns cached object when present', t => {
    const cache = new PipelineCache();
    const scriptText = new EvalContentFunction(() => 'foo');

    cache.storeScriptText('foo', scriptText);

    t.is(cache.getScriptText('foo'), scriptText);
});

test('[unit] PipelineCache.getScriptText() throws when object is not cached', t => {
    const cache = new PipelineCache();

    t.throws(() => cache.getScriptText('foo'));
});

test('[unit] PipelineCache.storeScriptText() can overwrite an existing entry', t => {
    const cache = new PipelineCache();
    const scriptText1 = new EvalContentFunction(() => 'foo');
    const scriptText2 = new EvalContentFunction(() => 'foo');

    cache.storeScriptText('foo', scriptText1);
    cache.storeScriptText('foo', scriptText2);

    t.is(cache.getScriptText('foo'), scriptText2);
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

    cache.storeFragment(new Fragment('foo', new DocumentNode()));
    cache.storeComponent(createTestComponent());
    cache.storeScriptText('foo', new EvalContentFunction(() => 'foo'));
    cache.storeCreatedResource('foo', 'foo');
    
    cache.clear();

    t.false(cache.hasFragment('foo'));
    t.false(cache.hasComponent('foo'));
    t.false(cache.hasScriptText('foo'));
    t.false(cache.hasCreatedResource('foo'));
});
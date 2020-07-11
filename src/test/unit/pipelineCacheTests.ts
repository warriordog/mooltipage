import test from 'ava';
import { PipelineCache, Fragment, DocumentNode, EvalContentFunction, Page, Component, ComponentTemplate, ComponentScript, ComponentScriptType } from '../../lib/index';

function createTestComponent(): Component {
    const template = new ComponentTemplate(new DocumentNode());
    const script = new ComponentScript(ComponentScriptType.FUNCTION, new EvalContentFunction(() => { return {} }))
    return new Component('foo', template, script);
}

/*
 * Page
 */

test('[unit] PipelineCache.hasPage() present', t => {
    const cache = new PipelineCache();

    cache.storePage(new Page('foo', new DocumentNode()));

    t.true(cache.hasPage('foo'));
});

test('[unit] PipelineCache.hasPage() missing', t => {
    const cache = new PipelineCache();

    t.false(cache.hasPage('foo'));
});

test('[unit] PipelineCache.getPage() present', t => {
    const cache = new PipelineCache();
    const page = new Page('foo', new DocumentNode());

    cache.storePage(page);

    t.is(cache.getPage('foo'), page);
});

test('[unit] PipelineCache.getPage() missing', t => {
    const cache = new PipelineCache();

    t.throws(() => cache.getPage('foo'));
});

test('[unit] PipelineCache overwrite page', t => {
    const cache = new PipelineCache();
    const page1 = new Page('foo', new DocumentNode());
    const page2 = new Page('foo', new DocumentNode());

    cache.storePage(page1);
    cache.storePage(page2);

    t.is(cache.getPage('foo'), page2);
});

/*
 * Fragment
 */

test('[unit] PipelineCache.hasFragment() present', t => {
    const cache = new PipelineCache();

    cache.storeFragment(new Fragment('foo', new DocumentNode()));

    t.true(cache.hasFragment('foo'));
});

test('[unit] PipelineCache.hasFragment() missing', t => {
    const cache = new PipelineCache();

    t.false(cache.hasFragment('foo'));
});

test('[unit] PipelineCache.getFragment() present', t => {
    const cache = new PipelineCache();
    const fragment = new Fragment('foo', new DocumentNode());

    cache.storeFragment(fragment);

    t.is(cache.getFragment('foo'), fragment);
});

test('[unit] PipelineCache.getFragment() missing', t => {
    const cache = new PipelineCache();

    t.throws(() => cache.getFragment('foo'));
});

test('[unit] PipelineCache overwrite fragment', t => {
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

test('[unit] PipelineCache.hasComponent() present', t => {
    const cache = new PipelineCache();

    cache.storeComponent(createTestComponent());

    t.true(cache.hasComponent('foo'));
});

test('[unit] PipelineCache.hasComponent() missing', t => {
    const cache = new PipelineCache();

    t.false(cache.hasComponent('foo'));
});

test('[unit] PipelineCache.getComponent() present', t => {
    const cache = new PipelineCache();
    const component = createTestComponent();

    cache.storeComponent(component);

    t.is(cache.getComponent('foo'), component);
});

test('[unit] PipelineCache.getComponent() missing', t => {
    const cache = new PipelineCache();

    t.throws(() => cache.getComponent('foo'));
});

test('[unit] PipelineCache overwrite component', t => {
    const cache = new PipelineCache();
    const component1 = createTestComponent();
    const component2 = createTestComponent();

    cache.storeComponent(component1);
    cache.storeComponent(component2);

    t.is(cache.getComponent('foo'), component2);
});

/*
 * TemplateString
 */

test('[unit] PipelineCache.hasTemplateString() present', t => {
    const cache = new PipelineCache();

    cache.storeTemplateString('foo', new EvalContentFunction(() => 'foo'));

    t.true(cache.hasTemplateString('foo'));
});

test('[unit] PipelineCache.hasTemplateString() missing', t => {
    const cache = new PipelineCache();

    t.false(cache.hasTemplateString('foo'));
});

test('[unit] PipelineCache.getTemplateString() present', t => {
    const cache = new PipelineCache();
    const templateString = new EvalContentFunction(() => 'foo');

    cache.storeTemplateString('foo', templateString);

    t.is(cache.getTemplateString('foo'), templateString);
});

test('[unit] PipelineCache.getTemplateString() missing', t => {
    const cache = new PipelineCache();

    t.throws(() => cache.getTemplateString('foo'));
});

test('[unit] PipelineCache overwrite templateString', t => {
    const cache = new PipelineCache();
    const templateString1 = new EvalContentFunction(() => 'foo');
    const templateString2 = new EvalContentFunction(() => 'foo');

    cache.storeTemplateString('foo', templateString1);
    cache.storeTemplateString('foo', templateString2);

    t.is(cache.getTemplateString('foo'), templateString2);
});

/*
 * Handlebars
 */

test('[unit] PipelineCache.hasHandlebars() present', t => {
    const cache = new PipelineCache();

    cache.storeHandlebars('foo', new EvalContentFunction(() => 'foo'));

    t.true(cache.hasHandlebars('foo'));
});

test('[unit] PipelineCache.hasHandlebars() missing', t => {
    const cache = new PipelineCache();

    t.false(cache.hasHandlebars('foo'));
});

test('[unit] PipelineCache.getHandlebars() present', t => {
    const cache = new PipelineCache();
    const handlebars = new EvalContentFunction(() => 'foo');

    cache.storeHandlebars('foo', handlebars);

    t.is(cache.getHandlebars('foo'), handlebars);
});

test('[unit] PipelineCache.getHandlebars() missing', t => {
    const cache = new PipelineCache();

    t.throws(() => cache.getHandlebars('foo'));
});

test('[unit] PipelineCache overwrite handlebars', t => {
    const cache = new PipelineCache();
    const handlebars1 = new EvalContentFunction(() => 'foo');
    const handlebars2 = new EvalContentFunction(() => 'foo');

    cache.storeHandlebars('foo', handlebars1);
    cache.storeHandlebars('foo', handlebars2);

    t.is(cache.getHandlebars('foo'), handlebars2);
});

/*
 * General
 */
test('[unit] PipelineCache.clear()', t => {
    const cache = new PipelineCache();
    cache.storeFragment(new Fragment('foo', new DocumentNode()));
    cache.storePage(new Page('foo', new DocumentNode()));
    cache.storeComponent(createTestComponent());
    cache.storeTemplateString('foo', new EvalContentFunction(() => 'foo'));
    cache.storeHandlebars('foo', new EvalContentFunction(() => 'foo'));
    
    cache.clear();

    t.false(cache.hasFragment('foo'));
    t.false(cache.hasPage('foo'));
    t.false(cache.hasComponent('foo'));
    t.false(cache.hasTemplateString('foo'));
    t.false(cache.hasHandlebars('foo'));
});
import test from 'ava';
import { TagNode } from '../../../lib';

// hasAttribute()
test('Attribute API: hasAttribute() basic functionality', t => {
    const node = new TagNode('test', new Map([['test', 'testValue']]));
    t.true(node.hasAttribute('test'));
    t.false(node.hasAttribute('test2'));
});
test('Attribute API: hasAttribute() supports null', t => {
    const node = new TagNode('test', new Map([['test', null]]));
    t.true(node.hasAttribute('test'));
});
test('Attribute API: hasAttribute() supports undefined', t => {
    const node = new TagNode('test', new Map([['test', undefined]]));
    t.true(node.hasAttribute('test'));
});
test('Attribute API: hasAttribute() supports objects', t => {
    const node = new TagNode('test', new Map([['test', {}]]));
    t.true(node.hasAttribute('test'));
});

// hasValueAttribute()
test('Attribute API: hasValueAttribute() basic functionality', t => {
    const node = new TagNode('test', new Map([['test', 'testValue']]));
    t.true(node.hasValueAttribute('test'));
    t.false(node.hasValueAttribute('test2'));
});
test('Attribute API: hasValueAttribute() supports null', t => {
    const node = new TagNode('test', new Map([['test', null]]));
    t.false(node.hasValueAttribute('test'));
});
test('Attribute API: hasValueAttribute() supports undefined', t => {
    const node = new TagNode('test', new Map([['test', undefined]]));
    t.false(node.hasValueAttribute('test'));
});
test('Attribute API: hasValueAttribute() supports objects', t => {
    const node = new TagNode('test', new Map([['test', {}]]));
    t.true(node.hasValueAttribute('test'));
});

// getAttribute()
test('Attribute API: getAttribute() basic functionality', t => {
    const node = new TagNode('test', new Map([['test', 'testValue']]));
    t.is(node.getAttribute('test'), 'testValue');
});
test('Attribute API: getAttribute() supports null', t => {
    const node = new TagNode('test', new Map([['test', null]]));
    t.is(node.getAttribute('test'), null);
});
test('Attribute API: getAttribute() supports undefined', t => {
    const node = new TagNode('test', new Map([['test', undefined]]));
    t.is(node.getAttribute('test'), undefined);
});
test('Attribute API: getAttribute() converts to string', t => {
    const node = new TagNode('test', new Map([['test', 1]]));
    t.is(node.getAttribute('test'), '1');
});
test('Attribute API: getAttribute() returns undefined if attribute not found', t => {
    const node = new TagNode('test');
    t.is(node.getAttribute('test'), undefined);
});

// getRequiredAttribute()
test('Attribute API: getRequiredAttribute() basic functionality', t => {
    const node = new TagNode('test', new Map([['test1', 'testValue'], ['test2', null]]));
    t.is(node.getRequiredAttribute('test1'), 'testValue');
    t.is(node.getRequiredAttribute('test2'), null);
});
test('Attribute API: getRequiredAttribute() throws if attribute not found', t => {
    const node = new TagNode('test');
    t.throws(() => node.getRequiredAttribute('test'));
});
test('Attribute API: getRequiredAttribute() converts to string', t => {
    const node = new TagNode('test', new Map([['test', 1]]));
    t.is(node.getRequiredAttribute('test'), '1');
});

// getRequiredValueAttribute()
test('Attribute API: getRequiredValueAttribute() basic functionality', t => {
    const node = new TagNode('test', new Map([['test', 'testValue']]));
    t.is(node.getRequiredValueAttribute('test'), 'testValue');
});
test('Attribute API: getRequiredValueAttribute() throws if attribute not found', t => {
    const node = new TagNode('test');
    t.throws(() => node.getRequiredValueAttribute('test'));
});
test('Attribute API: getRequiredValueAttribute() throws if attribute is null', t => {
    const node = new TagNode('test', new Map([['test', null]]));
    t.throws(() => node.getRequiredValueAttribute('test'));
});
test('Attribute API: getRequiredValueAttribute() converts to string', t => {
    const node = new TagNode('test', new Map([['test', 1]]));
    t.is(node.getRequiredValueAttribute('test'), '1');
});

// getOptionalValueAttribute()
test('Attribute API: getOptionalValueAttribute() basic functionality', t => {
    const node = new TagNode('test', new Map([['test', 'testValue']]));
    t.is(node.getOptionalValueAttribute('test'), 'testValue');
});
test('Attribute API: getOptionalValueAttribute() returns undefined if attribute not found', t => {
    const node = new TagNode('test');
    t.is(node.getOptionalValueAttribute('test'), undefined);
});
test('Attribute API: getOptionalValueAttribute() throws if attribute is null', t => {
    const node = new TagNode('test', new Map([['test', null]]));
    t.throws(() => node.getOptionalValueAttribute('test'));
});
test('Attribute API: getOptionalValueAttribute() converts to string', t => {
    const node = new TagNode('test', new Map([['test', 1]]));
    t.is(node.getOptionalValueAttribute('test'), '1');
});

// getRawAttribute()
test('Attribute API: getRawAttribute() basic functionality', t => {
    const node = new TagNode('test', new Map([['test', 'testValue']]));
    t.is(node.getRawAttribute('test'), 'testValue');
});
test('Attribute API: getRawAttribute() supports null', t => {
    const node = new TagNode('test', new Map([['test', null]]));
    t.is(node.getRawAttribute('test'), null);
});
test('Attribute API: getRawAttribute() supports undefined', t => {
    const node = new TagNode('test', new Map([['test', undefined]]));
    t.is(node.getRawAttribute('test'), undefined);
});
test('Attribute API: getRawAttribute() supports objects', t => {
    const obj = {};
    const node = new TagNode('test', new Map([['test', obj]]));
    t.is(node.getRawAttribute('test'), obj);
});
test('Attribute API: getRawAttribute() returns undefined if attribute not found', t => {
    const node = new TagNode('test');
    t.is(node.getRawAttribute('test'), undefined);
});

// setAttribute()
test('Attribute API: setAttribute() basic functionality', t => {
    const node = new TagNode('test');
    node.setAttribute('test', 'testValue');
    t.is(node.getRawAttribute('test'), 'testValue');
});
test('Attribute API: setAttribute() supports null', t => {
    const node = new TagNode('test');
    node.setAttribute('test', null);
    t.is(node.getRawAttribute('test'), null);
});
test('Attribute API: setAttribute() overwrites existing value', t => {
    const node = new TagNode('test');
    node.setAttribute('test', 'bad');
    node.setAttribute('test', 'good');
    t.is(node.getRawAttribute('test'), 'good');
});

// setRawAttribute()
test('Attribute API: setRawAttribute() basic functionality', t => {
    const node = new TagNode('test');
    node.setRawAttribute('test', 'testValue');
    t.is(node.getRawAttribute('test'), 'testValue');
});
test('Attribute API: setRawAttribute() supports null', t => {
    const node = new TagNode('test');
    node.setRawAttribute('test', null);
    t.is(node.getRawAttribute('test'), null);
});
test('Attribute API: setRawAttribute() supports undefined', t => {
    const node = new TagNode('test');
    node.setRawAttribute('test', undefined);
    t.is(node.getRawAttribute('test'), undefined);
});
test('Attribute API: setRawAttribute() supports objects', t => {
    const obj = {};
    const node = new TagNode('test');
    node.setRawAttribute('test', obj);
    t.is(node.getRawAttribute('test'), obj);
});
test('Attribute API: setRawAttribute() overwrites existing value', t => {
    const node = new TagNode('test');
    node.setRawAttribute('test', 'bad');
    node.setRawAttribute('test', 'good');
    t.is(node.getRawAttribute('test'), 'good');
});

// setBooleanAttribute()
test('Attribute API: setBooleanAttribute() basic functionality', t => {
    const node = new TagNode('test');
    node.setBooleanAttribute('test1', true);
    node.setBooleanAttribute('test2', false);
    t.true(node.hasAttribute('test1'));
    t.false(node.hasAttribute('test2'));
});
test('Attribute API: setBooleanAttribute() sets attribute value to null', t => {
    const node = new TagNode('test');
    node.setBooleanAttribute('test', true);
    t.is(node.getRawAttribute('test'), null);
});
test('Attribute API: setBooleanAttribute() overwrites existing value', t => {
    const node = new TagNode('test');
    node.setBooleanAttribute('test1', false);
    node.setBooleanAttribute('test1', true);
    node.setBooleanAttribute('test2', true);
    node.setBooleanAttribute('test2', false);
    t.true(node.hasAttribute('test1'));
    t.false(node.hasAttribute('test2'));
});

// setRequiredValueAttribute()
test('Attribute API: setRequiredValueAttribute() basic functionality', t => {
    const node = new TagNode('test');
    node.setRequiredValueAttribute('test', 'testValue');
    t.is(node.getRawAttribute('test'), 'testValue');
});
test('Attribute API: setRequiredValueAttribute() overwrites existing value', t => {
    const node = new TagNode('test');
    node.setRequiredValueAttribute('test', 'bad');
    node.setRequiredValueAttribute('test', 'good');
    t.is(node.getRawAttribute('test'), 'good');
});

// deleteAttribute()
test('Attribute API: deleteAttribute() basic functionality', t => {
    const node = new TagNode('test', new Map([['test', 'testValue']]));
    node.deleteAttribute('test');
    t.false(node.hasAttribute('test'));
});
test('Attribute API: deleteAttribute() does nothing is attribute does not exist', t => {
    const node = new TagNode('test');
    node.deleteAttribute('test');
    t.false(node.hasAttribute('test'));
});

// getAttributes()
test('Attribute API: getAttributes() basic functionality', t => {
    const node = new TagNode('test', new Map([['test', 'testValue']]));
    const attrs = node.getAttributes();
    t.is(attrs.size, 1);
    t.true(attrs.has('test'));
    t.is(attrs.get('test'), 'testValue');
});
test('Attribute API: getAttributes() includes undefined', t => {
    const node = new TagNode('test', new Map([['test', undefined]]));
    const attrs = node.getAttributes();
    t.is(attrs.size, 1);
    t.true(attrs.has('test'));
    t.is(attrs.get('test'), undefined);
});
test('Attribute API: getAttributes() includes null', t => {
    const node = new TagNode('test', new Map([['test', null]]));
    const attrs = node.getAttributes();
    t.is(attrs.size, 1);
    t.true(attrs.has('test'));
    t.is(attrs.get('test'), null);
});
test('Attribute API: getAttributes() includes objects', t => {
    const obj = {};
    const node = new TagNode('test', new Map([['test', obj]]));
    const attrs = node.getAttributes();
    t.is(attrs.size, 1);
    t.true(attrs.has('test'));
    t.is(attrs.get('test'), obj);
});
test('Attribute API: getAttributes() does NOT cast to string', t => {
    const node = new TagNode('test', new Map([['test', 1]]));
    const attrs = node.getAttributes();
    t.is(attrs.size, 1);
    t.true(attrs.has('test'));
    t.is(attrs.get('test'), 1);
});
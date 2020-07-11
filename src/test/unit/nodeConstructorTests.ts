import test from 'ava';
import { TagNode, TextNode, CommentNode, ProcessingInstructionNode, MFragmentNode, MComponentNode, MContentNode, MSlotNode, MVarNode } from '../../lib/index';

test('[unit] TagNode constructor', t => {
    const attributes: Map<string, string | null> = new Map([['foo', 'bar'], ['attr', null]]);

    const node = new TagNode('sometag', attributes);

    t.is(node.tagName, 'sometag');
    t.deepEqual(node.getAttributes(), attributes);
});

test('[unit] TagNode constructor defaults', t => {
    const node = new TagNode('sometag');

    t.is(node.tagName, 'sometag');
    t.is(node.getAttributes().size, 0);
});

test('[unit] TextNode constructor', t => {
    const node = new TextNode('text content');

    t.is(node.text, 'text content');
});

test('[unit] TextNode constructor defaults', t => {
    const node = new TextNode();

    t.is(node.text, '');
});

test('[unit] CommentNode constructor', t => {
    const node = new CommentNode('text content');

    t.is(node.text, 'text content');
});

test('[unit] CommentNode constructor defaults', t => {
    const node = new CommentNode();

    t.is(node.text, '');
});

test('[unit] ProcessingInstructionNode constructor', t => {
    const node = new ProcessingInstructionNode('name', 'data');

    t.is(node.name, 'name');
    t.is(node.data, 'data');
});

test('[unit] ProcessingInstructionNode constructor defaults', t => {
    const node = new ProcessingInstructionNode();

    t.is(node.name, '');
    t.is(node.data, '');
});

test('[unit] MFragmentNode constructor', t => {
    const attributes: Map<string, string | null> = new Map([['src', 'resId'], ['param', 'value']]);

    const node = new MFragmentNode(attributes);

    t.is(node.tagName, 'm-fragment');
    t.is(node.src, 'resId');
    t.deepEqual(node.parameters, new Map([['param', 'value']]));
    t.deepEqual(node.getAttributes(), attributes);
});

test('[unit] MFragmentNode constructor (invalid)', t => {
    const attributes: Map<string, string | null> = new Map([['param', 'value']]);

    t.throws(() => new MFragmentNode(attributes))
});

test('[unit] MComponentNode constructor', t => {
    const attributes: Map<string, string | null> = new Map([['src', 'resId'], ['param', 'value']]);

    const node = new MComponentNode(attributes);

    t.is(node.tagName, 'm-component');
    t.is(node.src, 'resId');
    t.deepEqual(node.parameters, new Map([['param', 'value']]));
    t.deepEqual(node.getAttributes(), attributes);
});

test('[unit] MComponentNode constructor (invalid)', t => {
    const attributes: Map<string, string | null> = new Map([['param', 'value']]);

    t.throws(() => new MComponentNode(attributes))
});

test('[unit] MContentNode constructor', t => {
    const attributes: Map<string, string | null> = new Map([['slot', 'slotName'], ['foo', 'bar']]);

    const node = new MContentNode(attributes);

    t.is(node.tagName, 'm-content');
    t.is(node.slotName, 'slotName');
    t.deepEqual(node.getAttributes(), attributes);
});

test('[unit] MContentNode constructor (default)', t => {
    const attributes: Map<string, string | null> = new Map([['param', 'value']]);

    const node = new MContentNode(attributes);

    t.is(node.slotName, '[default]');
});

test('[unit] MSlotNode constructor', t => {
    const attributes: Map<string, string | null> = new Map([['slot', 'slotName'], ['foo', 'bar']]);

    const node = new MSlotNode(attributes);

    t.is(node.tagName, 'm-slot');
    t.is(node.slotName, 'slotName');
    t.deepEqual(node.getAttributes(), attributes);
});

test('[unit] MSlotNode constructor (default)', t => {
    const attributes: Map<string, string | null> = new Map([['param', 'value']]);

    const node = new MSlotNode(attributes);

    t.is(node.slotName, '[default]');
});

test('[unit] MVarNode constructor', t => {
    const attributes: Map<string, string | null> = new Map([['param', 'value'], ['foo', 'bar'], ['attr', null]]);

    const node = new MVarNode(attributes);

    t.is(node.tagName, 'm-var');
    t.deepEqual(node.variables, new Map([['param', 'value'], ['foo', 'bar']]));
    t.deepEqual(node.getAttributes(), attributes);
});
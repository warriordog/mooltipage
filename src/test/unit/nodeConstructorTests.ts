import test from 'ava';
import { TagNode, TextNode, CommentNode, ProcessingInstructionNode, MFragmentNode, MComponentNode, MContentNode, MSlotNode, MVarNode } from '../../lib/index';

test('[unit] TagNode constructor handles arguments', t => {
    const attributes: Map<string, string | null> = new Map([['foo', 'bar'], ['attr', null]]);

    const node = new TagNode('sometag', attributes);

    t.is(node.tagName, 'sometag');
    t.deepEqual(node.getAttributes(), attributes);
});

test('[unit] TagNode constructor populates defaults', t => {
    const node = new TagNode('sometag');

    t.is(node.tagName, 'sometag');
    t.is(node.getAttributes().size, 0);
});

test('[unit] TextNode constructor handles arguments', t => {
    const node = new TextNode('text content');

    t.is(node.text, 'text content');
});

test('[unit] TextNode constructor populates defaults', t => {
    const node = new TextNode();

    t.is(node.text, '');
});

test('[unit] CommentNode constructor handles arguments', t => {
    const node = new CommentNode('text content');

    t.is(node.text, 'text content');
});

test('[unit] CommentNode constructor populates defaults', t => {
    const node = new CommentNode();

    t.is(node.text, '');
});

test('[unit] ProcessingInstructionNode constructor handles arguments', t => {
    const node = new ProcessingInstructionNode('name', 'data');

    t.is(node.name, 'name');
    t.is(node.data, 'data');
});

test('[unit] ProcessingInstructionNode constructor populates defaults', t => {
    const node = new ProcessingInstructionNode();

    t.is(node.name, '');
    t.is(node.data, '');
});

test('[unit] MFragmentNode constructor handles arguments', t => {
    const attributes: Map<string, string | null> = new Map([['src', 'resId'], ['param', 'value']]);

    const node = new MFragmentNode(attributes);

    t.is(node.tagName, 'm-fragment');
    t.is(node.src, 'resId');
    t.deepEqual(node.parameters, new Map([['param', 'value']]));
    t.deepEqual(node.getAttributes(), attributes);
});

test('[unit] MFragmentNode constructor throws on invalid arguments', t => {
    const attributes: Map<string, string | null> = new Map([['param', 'value']]);

    t.throws(() => new MFragmentNode(attributes))
});

test('[unit] MComponentNode constructor handles arguments', t => {
    const attributes: Map<string, string | null> = new Map([['src', 'resId'], ['param', 'value']]);

    const node = new MComponentNode(attributes);

    t.is(node.tagName, 'm-component');
    t.is(node.src, 'resId');
    t.deepEqual(node.parameters, new Map([['param', 'value']]));
    t.deepEqual(node.getAttributes(), attributes);
});

test('[unit] MComponentNode constructor throws on invalid arguments', t => {
    const attributes: Map<string, string | null> = new Map([['param', 'value']]);

    t.throws(() => new MComponentNode(attributes))
});

test('[unit] MContentNode constructor handles arguments', t => {
    const attributes: Map<string, string | null> = new Map([['slot', 'slotName'], ['foo', 'bar']]);

    const node = new MContentNode(attributes);

    t.is(node.tagName, 'm-content');
    t.is(node.slotName, 'slotName');
    t.deepEqual(node.getAttributes(), attributes);
});

test('[unit] MContentNode constructor populates defaults', t => {
    const attributes: Map<string, string | null> = new Map([['param', 'value']]);

    const node = new MContentNode(attributes);

    t.is(node.slotName, '[default]');
});

test('[unit] MSlotNode constructor handles arguments', t => {
    const attributes: Map<string, string | null> = new Map([['slot', 'slotName'], ['foo', 'bar']]);

    const node = new MSlotNode(attributes);

    t.is(node.tagName, 'm-slot');
    t.is(node.slotName, 'slotName');
    t.deepEqual(node.getAttributes(), attributes);
});

test('[unit] MSlotNode constructor populates defaults', t => {
    const attributes: Map<string, string | null> = new Map([['param', 'value']]);

    const node = new MSlotNode(attributes);

    t.is(node.slotName, '[default]');
});

test('[unit] MVarNode constructor handles arguments', t => {
    const attributes: Map<string, string | null> = new Map([['param', 'value'], ['foo', 'bar'], ['attr', null]]);

    const node = new MVarNode(attributes);

    t.is(node.tagName, 'm-var');
    t.deepEqual(node.variables, new Map([['param', 'value'], ['foo', 'bar']]));
    t.deepEqual(node.getAttributes(), attributes);
});
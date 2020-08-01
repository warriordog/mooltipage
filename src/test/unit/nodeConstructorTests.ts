import test from 'ava';
import { TagNode, TextNode, CommentNode, ProcessingInstructionNode, MFragmentNode, MComponentNode, MContentNode, MSlotNode, MVarNode, MScopeNode, MIfNode, MForOfNode, MForInNode, MImportFragmentNode, MImportComponentNode, MScriptNode, MDataNode, MimeType } from '../../lib';

test('[unit] TagNode constructor handles arguments', t => {
    const attributes: Map<string, unknown> = new Map([['foo', 'bar'], ['attr', null]]);

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
    const src = 'resPath';
    const attributes: Map<string, unknown> = new Map([['src', src], ['param', 'value']]);

    const node = new MFragmentNode(src, attributes);

    t.is(node.tagName, 'm-fragment');
    t.is(node.src, src);
    t.deepEqual(node.parameters, new Map([['param', 'value']]));
    t.deepEqual(node.getAttributes(), attributes);
});

test('[unit] MComponentNode constructor handles arguments', t => {
    const src = 'resPath';
    const attributes: Map<string, unknown> = new Map([['src', src], ['param', 'value']]);

    const node = new MComponentNode(src, attributes);

    t.is(node.tagName, 'm-component');
    t.is(node.src, src);
    t.deepEqual(node.parameters, new Map([['param', 'value']]));
    t.deepEqual(node.getAttributes(), attributes);
});

test('[unit] MContentNode constructor handles arguments', t => {
    const slot = 'slotName';
    const attributes: Map<string, unknown> = new Map([['slot', slot], ['foo', 'bar']]);

    const node = new MContentNode(slot, attributes);

    t.is(node.tagName, 'm-content');
    t.is(node.slot, 'slotName');
    t.deepEqual(node.getAttributes(), attributes);
});

test('[unit] MContentNode constructor populates defaults', t => {
    const attributes: Map<string, unknown> = new Map([['param', 'value']]);

    const node = new MContentNode(undefined, attributes);

    t.is(node.slot, '[default]');
    t.is(node.getAttribute('slot'), '[default]');
});

test('[unit] MSlotNode constructor handles arguments', t => {
    const slot = 'slotName';
    const attributes: Map<string, unknown> = new Map([['slot', slot], ['foo', 'bar']]);

    const node = new MSlotNode(slot, attributes);

    t.is(node.tagName, 'm-slot');
    t.is(node.slot, slot);
    t.deepEqual(node.getAttributes(), attributes);
});

test('[unit] MSlotNode constructor populates defaults', t => {
    const attributes: Map<string, unknown> = new Map([['param', 'value']]);

    const node = new MSlotNode(undefined, attributes);

    t.is(node.slot, '[default]');
    t.is(node.getAttribute('slot'), '[default]');
});

test('[unit] MVarNode constructor handles arguments', t => {
    const attributes: Map<string, unknown> = new Map([['param', 'value'], ['foo', 'bar'], ['attr', null]]);

    const node = new MVarNode(attributes);

    t.is(node.tagName, 'm-var');
    t.deepEqual(node.getAttributes(), attributes);
});

test('[unit] MImportFragmentNode constructor handles arguments', t => {
    const src = 'resPath';
    const as = 'foo';

    const node = new MImportFragmentNode(src, as, new Map());

    t.is(node.tagName, 'm-import');
    t.is(node.src, src);
    t.is(node.as, as);
    t.is(node.type, 'm-fragment');
    t.is(node.getAttribute('src'), src);
    t.is(node.getAttribute('as'), as);
    t.true(node.hasAttribute('fragment'));
});

test('[unit] MImportComponentNode constructor handles arguments', t => {
    const src = 'resPath';
    const as = 'foo';

    const node = new MImportComponentNode(src, as, new Map());

    t.is(node.tagName, 'm-import');
    t.is(node.src, src);
    t.is(node.as, as);
    t.is(node.type, 'm-component');
    t.is(node.getAttribute('src'), src);
    t.is(node.getAttribute('as'), as);
    t.true(node.hasAttribute('component'));
});

test('[unit] MScopeNode constructor handles arguments', t => {
    const attributes: Map<string, unknown> = new Map([['param', 'value'], ['foo', 'bar'], ['attr', null]]);

    const node = new MScopeNode(attributes);

    t.is(node.tagName, 'm-scope');
    t.deepEqual(node.getAttributes(), attributes);
});

test('[unit] MIfNode constructor handles arguments', t => {
    const condition = '{{ true }}';
    const node = new MIfNode(condition);

    t.is(node.tagName, 'm-if');
    t.is(node.condition, condition);
});

test('[unit] MForOfNode constructor handles arguments', t => {
    const varName = 'value';
    const indexName = 'i';
    const expression = '{{ [] }}';

    const node = new MForOfNode(expression, varName, indexName);

    t.is(node.tagName, 'm-for');
    t.is(node.expressionAttrName, 'of');
    t.is(node.varName, varName);
    t.is(node.indexName, indexName);
    t.is(node.expression, expression);
});

test('[unit] MForInNode constructor handles arguments', t => {
    const varName = 'key';
    const indexName = 'i';
    const expression = '{{ {} }}';

    const node = new MForInNode(expression, varName, indexName);

    t.is(node.tagName, 'm-for');
    t.is(node.expressionAttrName, 'in');
    t.is(node.varName, varName);
    t.is(node.indexName, indexName);
    t.is(node.expression, expression);
});

test('[unit] MScriptNode constructor handles src', t => {
    const src = 'script.js';

    const node = new MScriptNode(src);

    t.is(node.tagName, 'm-script');
    t.is(node.src, src);
    t.is(node.getRawAttribute('src'), src);
});


test('[unit] MDataNode constructor accepts JSON type', t => {
    const node = new MDataNode(MimeType.JSON);

    t.is(node.tagName, 'm-data');
    t.is(node.type, MimeType.JSON);
    t.is(node.getRawAttribute('type'), MimeType.JSON);
});

test('[unit] MDataNode constructor accepts TEXT type', t => {
    const node = new MDataNode(MimeType.TEXT);

    t.is(node.tagName, 'm-data');
    t.is(node.type, MimeType.TEXT);
    t.is(node.getRawAttribute('type'), MimeType.TEXT);
});

test('[unit] MDataNode parses no references', t => {
    const node = new MDataNode(MimeType.TEXT);

    t.is(node.references.length, 0);
});

test('[unit] MDataNode parses single reference', t => {
    const node = new MDataNode(MimeType.TEXT, new Map([['foo', 'source.txt']]));

    t.is(node.references.length, 1);
    t.is(node.references[0].resPath, 'source.txt');
    t.is(node.references[0].varName, 'foo');
});

test('[unit] MDataNode parses multiple references', t => {
    const references: [string, string][] = [
        ['foo1', 'source1.txt'],
        ['foo2', 'source2.txt'],
        ['foo3', 'source3.txt']
    ]
    const node = new MDataNode(MimeType.TEXT, new Map(references));

    t.is(node.references.length, references.length);
    for (let i = 0; i < references.length; i++) {
        const expectedRef = references[i];
        const actualRef = node.references[i];

        t.is(actualRef.resPath, expectedRef[1]);
        t.is(actualRef.varName, expectedRef[0]);
    }
});
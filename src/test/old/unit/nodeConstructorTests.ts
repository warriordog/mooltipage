import test
    from 'ava';
import {
    AnchorNodeResolve,
    CommentNode,
    CompiledAnchorNode,
    ExternalScriptNode,
    ExternalStyleNode,
    InternalScriptNode,
    InternalStyleNode,
    MContentNode,
    MDataNode,
    MForInNode,
    MForOfNode,
    MFragmentNode,
    MIfNode,
    MimeType,
    MImportNode,
    MScopeNode,
    MSlotNode,
    MVarNode,
    MWhitespaceNode,
    MWhitespaceNodeMode,
    ProcessingInstructionNode,
    SlotReferenceNode,
    StyleNodeBind,
    TagNode,
    TextNode,
    UncompiledAnchorNode,
    UncompiledScriptNode,
    UncompiledStyleNode
} from '../../../lib';

test('TagNode constructor handles arguments', t => {
    const attributes: Map<string, unknown> = new Map([['foo', 'bar'], ['attr', null]]);

    const node = new TagNode('test', attributes);

    t.is(node.tagName, 'test');
    t.deepEqual(node.getAttributes(), attributes);
});

test('TagNode constructor populates defaults', t => {
    const node = new TagNode('test');

    t.is(node.tagName, 'test');
    t.is(node.getAttributes().size, 0);
});

test('TextNode constructor handles arguments', t => {
    const node = new TextNode('  text content  ');

    t.is(node.text, '  text content  ');
    t.is(node.textContent, 'text content');
    t.true(node.hasContent);
});

test('TextNode constructor populates defaults', t => {
    const node = new TextNode();

    t.is(node.text, '');
    t.is(node.textContent, '');
    t.false(node.hasContent);
});

test('CommentNode constructor handles arguments', t => {
    const node = new CommentNode('text content');

    t.is(node.text, 'text content');
});

test('CommentNode constructor populates defaults', t => {
    const node = new CommentNode();

    t.is(node.text, '');
});

test('ProcessingInstructionNode constructor handles arguments', t => {
    const node = new ProcessingInstructionNode('name', 'data');

    t.is(node.name, 'name');
    t.is(node.data, 'data');
});

test('ProcessingInstructionNode constructor populates defaults', t => {
    const node = new ProcessingInstructionNode();

    t.is(node.name, '');
    t.is(node.data, '');
});

test('MFragmentNode constructor handles arguments', t => {
    const src = 'resPath';
    const attributes: Map<string, unknown> = new Map([['src', src], ['param', 'value']]);

    const node = new MFragmentNode(src, attributes);

    t.is(node.tagName, 'm-fragment');
    t.is(node.src, src);
    t.deepEqual(node.parameters, [['param', 'value']]);
    t.deepEqual(node.getAttributes(), attributes);
});

test('MContentNode constructor handles arguments', t => {
    const slot = 'slotName';
    const attributes: Map<string, unknown> = new Map([['slot', slot], ['foo', 'bar']]);

    const node = new MContentNode(slot, attributes);

    t.is(node.tagName, 'm-content');
    t.is(node.slot, 'slotName');
    t.deepEqual(node.getAttributes(), attributes);
});

test('MContentNode constructor populates defaults', t => {
    const attributes: Map<string, unknown> = new Map([['param', 'value']]);

    const node = new MContentNode(undefined, attributes);

    t.is(node.slot, SlotReferenceNode.DefaultSlotName);
    t.is(node.getAttribute('slot'), SlotReferenceNode.DefaultSlotName);
});

test('MSlotNode constructor handles arguments', t => {
    const slot = 'slotName';
    const attributes: Map<string, unknown> = new Map([['slot', slot], ['foo', 'bar']]);

    const node = new MSlotNode(slot, attributes);

    t.is(node.tagName, 'm-slot');
    t.is(node.slot, slot);
    t.deepEqual(node.getAttributes(), attributes);
});

test('MSlotNode constructor populates defaults', t => {
    const attributes: Map<string, unknown> = new Map([['param', 'value']]);

    const node = new MSlotNode(undefined, attributes);

    t.is(node.slot, SlotReferenceNode.DefaultSlotName);
    t.is(node.getAttribute('slot'), SlotReferenceNode.DefaultSlotName);
});

test('MVarNode constructor handles arguments', t => {
    const attributes: Map<string, unknown> = new Map([['param', 'value'], ['foo', 'bar'], ['attr', null]]);

    const node = new MVarNode(attributes);

    t.is(node.tagName, 'm-var');
    t.deepEqual(node.getAttributes(), attributes);
});

test('MImportNode constructor handles arguments', t => {
    const src = 'resPath';
    const as = 'foo';

    const node = new MImportNode(src, as, new Map());

    t.is(node.tagName, 'm-import');
    t.is(node.src, src);
    t.is(node.as, as);
    t.is(node.getAttribute('src'), src);
    t.is(node.getAttribute('as'), as);
});

test('MScopeNode constructor handles arguments', t => {
    const attributes: Map<string, unknown> = new Map([['param', 'value'], ['foo', 'bar'], ['attr', null]]);

    const node = new MScopeNode(attributes);

    t.is(node.tagName, 'm-scope');
    t.deepEqual(node.getAttributes(), attributes);
});

test('MIfNode constructor handles arguments', t => {
    const condition = '{{ true }}';
    const node = new MIfNode(condition);

    t.is(node.tagName, 'm-if');
    t.is(node.condition, condition);
});

test('MForOfNode constructor handles arguments', t => {
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

test('MForInNode constructor handles arguments', t => {
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

test('MDataNode constructor accepts JSON type', t => {
    const node = new MDataNode(MimeType.JSON);

    t.is(node.tagName, 'm-data');
    t.is(node.type, MimeType.JSON);
    t.is(node.getRawAttribute('type'), MimeType.JSON);
});

test('MDataNode constructor accepts TEXT type', t => {
    const node = new MDataNode(MimeType.TEXT);

    t.is(node.tagName, 'm-data');
    t.is(node.type, MimeType.TEXT);
    t.is(node.getRawAttribute('type'), MimeType.TEXT);
});

test('MDataNode parses no references', t => {
    const node = new MDataNode(MimeType.TEXT);

    t.is(node.references.length, 0);
});

test('MDataNode parses single reference', t => {
    const node = new MDataNode(MimeType.TEXT, new Map([['foo', 'source.txt']]));

    t.is(node.references.length, 1);
    t.is(node.references[0].resPath, 'source.txt');
    t.is(node.references[0].varName, 'foo');
});

test('MDataNode parses multiple references', t => {
    const references: Array<[string, string]> = [
        ['foo1', 'source1.txt'],
        ['foo2', 'source2.txt'],
        ['foo3', 'source3.txt']
    ];
    const node = new MDataNode(MimeType.TEXT, new Map(references));

    t.is(node.references.length, references.length);
    for (let i = 0; i < references.length; i++) {
        const expectedRef = references[i];
        const actualRef = node.references[i];

        t.is(actualRef.resPath, expectedRef[1]);
        t.is(actualRef.varName, expectedRef[0]);
    }
});

test('UncompiledStyleNode.compiled value is correct', t => {
    const node = new UncompiledStyleNode();

    t.false(node.compiled);
    t.false(node.hasAttribute('compiled'));
});

test('InternalStyleNode.compiled value is correct', t => {
    const node = new InternalStyleNode();

    t.true(node.compiled);
});

test('InternalStyleNode.bind works', t => {
    const node = new InternalStyleNode(StyleNodeBind.LINK);

    t.is(node.bind, StyleNodeBind.LINK);
    t.is(node.getRawAttribute('bind'), StyleNodeBind.LINK);

    node.bind = StyleNodeBind.HEAD;

    t.is(node.bind, StyleNodeBind.HEAD);
    t.is(node.getRawAttribute('bind'), StyleNodeBind.HEAD);
});

test('InternalStyleNode.bind default value is populated', t => {
    const node = new InternalStyleNode();

    t.is(node.bind, StyleNodeBind.HEAD);
});

test('InternalStyleNode.styleContent works', t => {
    const css = '.class {}';

    const node = new InternalStyleNode();
    node.appendChild(new TextNode(css));

    t.is(node.styleContent, css);
});

test('InternalStyleNode.styleContent default value is populated', t => {
    const node = new InternalStyleNode();

    t.is(node.styleContent, '');
});

test('ExternalStyleNode.compiled value is correct', t => {
    const node = new ExternalStyleNode('test.css');

    t.true(node.compiled);
});

test('ExternalStyleNode.bind works', t => {
    const node = new ExternalStyleNode('test.css', StyleNodeBind.LINK);

    t.is(node.bind, StyleNodeBind.LINK);
    t.is(node.getRawAttribute('bind'), StyleNodeBind.LINK);

    node.bind = StyleNodeBind.HEAD;

    t.is(node.bind, StyleNodeBind.HEAD);
    t.is(node.getRawAttribute('bind'), StyleNodeBind.HEAD);
});

test('ExternalStyleNode.bind default value is populated', t => {
    const node = new ExternalStyleNode('test.css');

    t.is(node.bind, StyleNodeBind.HEAD);
});

test('ExternalStyleNode.src works', t => {
    const node = new ExternalStyleNode('test.css');

    t.is(node.src, 'test.css');
    t.is(node.getRawAttribute('src'), 'test.css');

    node.src = 'new.css';

    t.is(node.src, 'new.css');
    t.is(node.getRawAttribute('src'), 'new.css');
});

test('UncompiledScriptNode.compiled value is populated', t => {
    const node = new UncompiledScriptNode();

    t.false(node.compiled);
    t.false(node.hasAttribute('compiled'));
});

test('InternalScriptNode.compiled value is correct', t => {
    const node = new InternalScriptNode();

    t.true(node.compiled);
});

test('InternalScriptNode.scriptContent works', t => {
    const js = 'function () {}';

    const node = new InternalScriptNode();
    node.appendChild(new TextNode(js));

    t.is(node.scriptContent, js);
});

test('InternalScriptNode.scriptContent default value is populated', t => {
    const node = new InternalScriptNode();

    t.is(node.scriptContent, '');
});

test('ExternalScriptNode.compiled value is correct', t => {
    const node = new ExternalScriptNode('test.js');

    t.true(node.compiled);
});

test('ExternalScriptNode.src works', t => {
    const node = new ExternalScriptNode('test.js');

    t.is(node.src, 'test.js');
    t.is(node.getRawAttribute('src'), 'test.js');

    node.src = 'new.js';

    t.is(node.src, 'new.js');
    t.is(node.getRawAttribute('src'), 'new.js');
});

test('UncompiledAnchorNode sets compiled', t => {
    const node = new UncompiledAnchorNode();

    t.false(node.compiled);
    t.false(node.hasAttribute('compiled'));
});

test('CompiledAnchorNode sets compiled', t => {
    const node = new CompiledAnchorNode('href');

    t.true(node.compiled);
    t.true(node.hasAttribute('compiled'));
});

test('CompiledAnchorNode sets href', t => {
    const node = new CompiledAnchorNode('href.html');

    t.is(node.href, 'href.html');
    t.is(node.getAttribute('href'), 'href.html');
});

test('CompiledAnchorNode sets resolve', t => {
    const node = new CompiledAnchorNode('href.html', AnchorNodeResolve.ROOT);

    t.is(node.resolve, AnchorNodeResolve.ROOT);
    t.is(node.getAttribute('resolve'), AnchorNodeResolve.ROOT);
});

test('CompiledAnchorNode sets default resolve', t => {
    const node = new CompiledAnchorNode('href.html');

    t.is(node.resolve, AnchorNodeResolve.NONE);
    t.is(node.getAttribute('resolve'), AnchorNodeResolve.NONE);
});

test('MWhitespaceNode constructor accepts parameters', t => {
    const node1 = new MWhitespaceNode(MWhitespaceNodeMode.SENSITIVE);
    const node2 = new MWhitespaceNode(MWhitespaceNodeMode.INSENSITIVE);
    
    t.is(node1.mode, MWhitespaceNodeMode.SENSITIVE);
    t.is(node2.mode, MWhitespaceNodeMode.INSENSITIVE);

    t.is(node1.getRawAttribute('mode'), MWhitespaceNodeMode.SENSITIVE);
    t.is(node2.getRawAttribute('mode'), MWhitespaceNodeMode.INSENSITIVE);
});

test('MWhitespaceNode sets defaults', t => {
    const node = new MWhitespaceNode();

    t.is(node.mode, MWhitespaceNodeMode.SENSITIVE);
    t.is(node.getRawAttribute('mode'), MWhitespaceNodeMode.SENSITIVE);
});
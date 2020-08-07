import test from 'ava';
import { FragmentModule } from '../../lib/pipeline/module/compiler/fragmentModule';
import { MContentNode, TagNode, MFragmentNode, DocumentNode } from '../../lib';

test('FragmentModule.extractSlotContents() handles default slot', t => {
    const frag = new MFragmentNode('foo.html');
    const child1 = new TagNode('div');
    const child2 = new TagNode('div');
    frag.appendChildren([ child1, child2 ]);

    const contents = FragmentModule.extractSlotContents(frag);
    t.is(contents.size, 1);
    t.true(contents.has('[default]'));

    const defaultDom = contents.get('[default]') as DocumentNode;
    t.is(defaultDom.firstChild, child1);
    t.is(defaultDom.lastChild, child2);
});

test('FragmentModule.extractSlotContents() handles named slots', t => {
    const frag = new MFragmentNode('foo.html');
    const mContents = new MContentNode('slot1');
    const child1 = new TagNode('div');
    const child2 = new TagNode('div');
    mContents.appendChildren([ child1, child2 ]);
    frag.appendChild(mContents);

    const contents = FragmentModule.extractSlotContents(frag);
    t.is(contents.size, 1);

    t.true(contents.has('slot1'));
    const slot1Dom = contents.get('slot1') as DocumentNode;
    t.is(slot1Dom.firstChild, child1);
    t.is(slot1Dom.lastChild, child2);
});

test('FragmentModule.extractSlotContents() handles multiple slots', t => {
    const frag = new MFragmentNode('foo.html');
    const contents1 = new MContentNode('slot1');
    const child1 = new TagNode('div');
    contents1.appendChild(child1);
    const contents2 = new MContentNode('slot2');
    const child2 = new TagNode('div');
    contents2.appendChild(child2);
    const child3 = new TagNode('div');
    frag.appendChildren([ contents1, contents2, child3 ]);

    const contents = FragmentModule.extractSlotContents(frag);
    t.is(contents.size, 3);

    t.true(contents.has('slot1'));
    const slot1Dom = contents.get('slot1') as DocumentNode;
    t.is(slot1Dom.firstChild, child1);
    t.is(slot1Dom.lastChild, child1);
    
    t.true(contents.has('slot2'));
    const slot2Dom = contents.get('slot2') as DocumentNode;
    t.is(slot2Dom.firstChild, child2);
    t.is(slot2Dom.lastChild, child2);
    
    t.true(contents.has('[default]'));
    const defDom = contents.get('[default]') as DocumentNode;
    t.is(defDom.firstChild, child3);
    t.is(defDom.lastChild, child3);
});

test('FragmentModule.convertNodeToContent() handles <m-content>', t => {
    const node = new MContentNode('test');
    const child = new TagNode('div');
    node.appendChild(child);

    const contents = FragmentModule.convertNodeToContent(node);
    t.is(contents.length, 1);
    t.is(contents[0], child);
});

test('FragmentModule.convertNodeToContent() handles other node types', t => {
    const node = new TagNode('div');

    const contents = FragmentModule.convertNodeToContent(node);
    t.is(contents.length, 1);
    t.is(contents[0], node);
});

test('FragmentModule.getContentTargetName() handles <m-content>', t => {
    const node = new MContentNode('test');

    t.is(FragmentModule.getContentTargetName(node), 'test');
});

test('FragmentModule.getContentTargetName() handles other node types', t => {
    const node = new TagNode('div');

    t.is(FragmentModule.getContentTargetName(node), '[default]');
});

test('FragmentModule.createFragmentScope ignores src', t => {
    const node = new MFragmentNode('foo.html');

    const scope = FragmentModule.createFragmentScope(node);

    t.is(scope.src, undefined);
});

test('FragmentModule.createFragmentScope copies all params', t => {
    const node = new MFragmentNode('foo.html');
    node.setRawAttribute('key1', 'value1');
    node.setRawAttribute('key2', 'value2');
    node.nodeData.key1 = 'value1';
    node.nodeData.key2 = 'value2';

    const scope = FragmentModule.createFragmentScope(node);

    t.is(scope.key1, 'value1');
    t.is(scope.key2, 'value2');
});

test('FragmentModule.createFragmentScope preserves non-string values', t => {
    const node = new MFragmentNode('foo.html');
    node.setRawAttribute('key1', 123);
    node.setRawAttribute('key2', 456);
    node.nodeData.key1 = 123;
    node.nodeData.key2 = 456;

    const scope = FragmentModule.createFragmentScope(node);

    t.is(scope.key1, 123);
    t.is(scope.key2, 456);
});

test('FragmentModule.createFragmentScope converts parameter names', t => {
    const node = new MFragmentNode('foo.html');
    node.setRawAttribute('key-name1', 'value1');
    node.setRawAttribute('key-name2', 'value2');
    node.nodeData.keyName1 = 'value1';
    node.nodeData.keyName2 = 'value2';

    const scope = FragmentModule.createFragmentScope(node);

    t.is(scope.keyName1, 'value1');
    t.is(scope.keyName2, 'value2');
});
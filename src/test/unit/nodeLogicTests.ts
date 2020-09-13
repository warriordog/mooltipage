import test from 'ava';
import { TagNode, DocumentNode, Node, TextNode } from '../../lib';
import * as NodeLogic from '../../lib/dom/nodeLogic';

test('NodeLogic.detachNode removes nodes', t => {
    const parent = new TagNode('div');
    const child = new TagNode('div');
    NodeLogic.appendChild(parent, child);
    NodeLogic.detachNode(child);

    t.falsy(child.parentNode);
    t.falsy(child.nextSibling);
    t.falsy(child.prevSibling);
    t.falsy(parent.firstChild);
    t.falsy(parent.lastChild);
    t.false(parent.childNodes.includes(child));
    t.falsy(Object.getPrototypeOf(child.nodeData));
    t.is(parent.childNodes.length, 0);
});

test('NodeLogic.hasChild detects children', t => {
    const parent = new TagNode('div');
    const child = new TagNode('div');
    const notChild = new TagNode('div');
    NodeLogic.appendChild(parent, child);

    t.true(NodeLogic.hasChild(parent, child));
    t.false(NodeLogic.hasChild(parent, notChild));
});

test('NodeLogic.appendChild appends children', t => {
    const parent = new TagNode('div');
    const child1 = new TagNode('div');
    const child2 = new TagNode('div');
    NodeLogic.appendChild(parent, child1);
    NodeLogic.appendChild(parent, child2);

    t.is(child1.parentNode, parent);
    t.is(child2.parentNode, parent);
    t.true(parent.childNodes.includes(child1));
    t.true(parent.childNodes.includes(child2));
    t.is(parent.firstChild, child1);
    t.is(parent.lastChild, child2);
    t.is(child1.nextSibling, child2);
    t.is(child2.prevSibling, child1);
    t.is(Object.getPrototypeOf(child1.nodeData), parent.nodeData);
    t.is(Object.getPrototypeOf(child2.nodeData), parent.nodeData);
});

test('NodeLogic.appendChild will not append a DocumentNode', t => {
    const parent = new TagNode('div');
    const child = new DocumentNode();

    t.throws(() => NodeLogic.appendChild(parent, child));
});

test('NodeLogic.prependChild inserts children', t => {
    const parent = new TagNode('div');
    const child1 = new TagNode('div');
    const child2 = new TagNode('div');
    NodeLogic.prependChild(parent, child1);
    NodeLogic.prependChild(parent, child2);

    t.is(child1.parentNode, parent);
    t.is(child2.parentNode, parent);
    t.true(parent.childNodes.includes(child1));
    t.true(parent.childNodes.includes(child2));
    t.is(parent.firstChild, child2);
    t.is(parent.lastChild, child1);
    t.is(child1.prevSibling, child2);
    t.is(child2.nextSibling, child1);
    t.is(Object.getPrototypeOf(child1.nodeData), parent.nodeData);
    t.is(Object.getPrototypeOf(child2.nodeData), parent.nodeData);
});

test('NodeLogic.prependChild will not prepend a DocumentNode', t => {
    const parent = new TagNode('div');
    const child = new DocumentNode();

    t.throws(() => NodeLogic.prependChild(parent, child));
});

test('NodeLogic.clear removes all child nodes', t => {
    const parent = new TagNode('div');
    const child1 = new TagNode('div');
    const child2 = new TagNode('div');
    NodeLogic.appendChild(parent, child1);
    NodeLogic.appendChild(parent, child2);
    NodeLogic.clear(parent);

    t.falsy(child1.parentNode);
    t.falsy(child2.parentNode);
    t.falsy(parent.firstChild);
    t.falsy(parent.lastChild);
    t.false(parent.childNodes.includes(child1));
    t.false(parent.childNodes.includes(child2));
    t.is(parent.childNodes.length, 0);
    t.falsy(Object.getPrototypeOf(child1.nodeData));
    t.falsy(Object.getPrototypeOf(child2.nodeData));
});

test('NodeLogic.appendChildNodes appends all child nodes', t => {
    const parent = new TagNode('div');
    const child1 = new TagNode('div');
    const child2 = new TagNode('div');
    NodeLogic.appendChildNodes(parent, [ child1, child2 ]);

    t.is(child1.parentNode, parent);
    t.is(child2.parentNode, parent);
    t.true(parent.childNodes.includes(child1));
    t.true(parent.childNodes.includes(child2));
    t.is(parent.firstChild, child1);
    t.is(parent.lastChild, child2);
    t.is(child1.nextSibling, child2);
    t.is(child2.prevSibling, child1);
    t.is(Object.getPrototypeOf(child1.nodeData), parent.nodeData);
    t.is(Object.getPrototypeOf(child2.nodeData), parent.nodeData);
});

test('NodeLogic.appendChildNodes will not append a DocumentNode', t => {
    const parent = new TagNode('div');
    const child = new DocumentNode();

    t.throws(() => NodeLogic.appendChildNodes(parent, [ child ]));
});

test('NodeLogic.prependChildNodes appends all child nodes', t => {
    const parent = new TagNode('div');
    const child1 = new TagNode('div');
    const child2 = new TagNode('div');
    const child3 = new TagNode('div');
    NodeLogic.appendChild(parent, child1);
    NodeLogic.prependChildNodes(parent, [ child2, child3 ]);

    t.is(child1.parentNode, parent);
    t.is(child2.parentNode, parent);
    t.is(child3.parentNode, parent);
    t.true(parent.childNodes.includes(child1));
    t.true(parent.childNodes.includes(child2));
    t.true(parent.childNodes.includes(child3));
    t.is(parent.firstChild, child2);
    t.is(parent.lastChild, child1);
    t.is(child2.nextSibling, child3);
    t.is(child3.prevSibling, child2);
    t.is(child3.nextSibling, child1);
    t.is(child1.prevSibling, child3);
    t.is(Object.getPrototypeOf(child1.nodeData), parent.nodeData);
    t.is(Object.getPrototypeOf(child2.nodeData), parent.nodeData);
    t.is(Object.getPrototypeOf(child3.nodeData), parent.nodeData);
});

test('NodeLogic.prependChildNodes will not append a DocumentNode', t => {
    const parent = new TagNode('div');
    const child = new DocumentNode();

    t.throws(() => NodeLogic.prependChildNodes(parent, [ child ]));
});

test('NodeLogic.appendSibling appends sibling', t => {
    const parent = new TagNode('div');
    const child1 = new TagNode('div');
    const child2 = new TagNode('div');
    NodeLogic.appendChild(parent, child1);
    NodeLogic.appendSibling(child2, child1);
    
    t.is(child1.parentNode, parent);
    t.is(child2.parentNode, parent);
    t.true(parent.childNodes.includes(child1));
    t.true(parent.childNodes.includes(child2));
    t.is(parent.firstChild, child1);
    t.is(parent.lastChild, child2);
    t.is(child1.nextSibling, child2);
    t.is(child2.prevSibling, child1);
    t.is(Object.getPrototypeOf(child1.nodeData), parent.nodeData);
    t.is(Object.getPrototypeOf(child2.nodeData), parent.nodeData);
});

test('NodeLogic.appendSibling will not append a DocumentNode', t => {
    const parent = new TagNode('div');
    const child1 = new TagNode('div');
    const child2 = new DocumentNode();
    NodeLogic.appendChild(parent, child1);

    t.throws(() => NodeLogic.appendSibling(child2, child1));
});

test('NodeLogic.prependSibling inserts sibling', t => {
    const parent = new TagNode('div');
    const child1 = new TagNode('div');
    const child2 = new TagNode('div');
    NodeLogic.appendChild(parent, child1);
    NodeLogic.prependSibling(child2, child1);

    t.is(child1.parentNode, parent);
    t.is(child2.parentNode, parent);
    t.true(parent.childNodes.includes(child1));
    t.true(parent.childNodes.includes(child2));
    t.is(parent.firstChild, child2);
    t.is(parent.lastChild, child1);
    t.is(child1.prevSibling, child2);
    t.is(child2.nextSibling, child1);
    t.is(Object.getPrototypeOf(child1.nodeData), parent.nodeData);
    t.is(Object.getPrototypeOf(child2.nodeData), parent.nodeData);
});

test('NodeLogic.prependSibling will not append a DocumentNode', t => {
    const parent = new TagNode('div');
    const child1 = new TagNode('div');
    const child2 = new DocumentNode();
    NodeLogic.appendChild(parent, child1);

    t.throws(() => NodeLogic.prependSibling(child2, child1));
});

test('NodeLogic.replaceNode works with no replacements', t => {
    const root = new TagNode('div');
    const parent = new TagNode('div');
    const child1 = new TagNode('div');
    NodeLogic.appendChild(root, parent);
    NodeLogic.appendChild(parent, child1);

    NodeLogic.replaceNode(child1, []);

    t.falsy(child1.parentNode);
    t.falsy(child1.prevSibling);
    t.falsy(child1.nextSibling);
    t.is(parent.childNodes.length, 0);
    t.is(parent.parentNode, root);
});

test('NodeLogic.replaceNode works with one replacement', t => {
    const root = new TagNode('div');
    const parent = new TagNode('div');
    const child1 = new TagNode('div');
    const child2 = new TagNode('div');
    NodeLogic.appendChild(root, parent);
    NodeLogic.appendChild(parent, child1);

    NodeLogic.replaceNode(child1, [ child2 ]);

    t.is(parent.parentNode, root);
    t.is(parent.childNodes.length, 1);
    t.falsy(child1.parentNode);
    t.falsy(child1.prevSibling);
    t.falsy(child1.nextSibling);
    t.is(child2.parentNode, parent);
});

test('NodeLogic.replaceNode works with multiple replacements', t => {
    const root = new TagNode('div');
    const parent = new TagNode('div');
    const child1 = new TagNode('div');
    const child2 = new TagNode('div');
    const child3 = new TagNode('div');
    const child4 = new TagNode('div');
    NodeLogic.appendChild(root, parent);
    NodeLogic.appendChild(parent, child1);

    NodeLogic.replaceNode(child1, [ child2, child3, child4 ]);

    t.is(parent.parentNode, root);
    t.is(parent.childNodes.length, 3);
    t.falsy(child1.parentNode);
    t.falsy(child1.prevSibling);
    t.falsy(child1.nextSibling);
    t.is(child2.parentNode, parent);
    t.is(child3.parentNode, parent);
    t.is(child4.parentNode, parent);
    t.is(parent.firstChild, child2);
    t.is(parent.lastChild, child4);
    t.falsy(child2.prevSibling);
    t.is(child2.nextSibling, child3);
    t.is(child3.prevSibling, child2);
    t.is(child3.nextSibling, child4);
    t.is(child4.prevSibling, child3);
    t.falsy(child4.nextSibling);
});

test('NodeLogic.replaceNode works with neighbors', t => {
    const root = new TagNode('div');
    const parent = new TagNode('div');
    const child1 = new TagNode('div');
    const child2 = new TagNode('div');
    const child3 = new TagNode('div');
    const child4 = new TagNode('div');
    NodeLogic.appendChild(root, parent);
    NodeLogic.appendChild(parent, child1);
    NodeLogic.appendChild(parent, child2);
    NodeLogic.appendChild(parent, child3);

    NodeLogic.replaceNode(child2, [ child4 ]);
    // is now [1][4][3]

    t.is(parent.parentNode, root);
    t.is(parent.childNodes.length, 3);
    t.falsy(child2.parentNode);
    t.falsy(child2.prevSibling);
    t.falsy(child2.nextSibling);
    t.is(child1.parentNode, parent);
    t.is(child3.parentNode, parent);
    t.is(child4.parentNode, parent);
    t.is(parent.firstChild, child1);
    t.is(parent.lastChild, child3);
    t.falsy(child1.prevSibling);
    t.is(child1.nextSibling, child4);
    t.is(child4.prevSibling, child1);
    t.is(child4.nextSibling, child3);
    t.is(child3.prevSibling, child4);
    t.falsy(child3.nextSibling);
});

test('NodeLogic.replaceNode can promote child nodes', t => {
    const root = new TagNode('div');
    const parent = new TagNode('div');
    const child1 = new TagNode('div');
    const child2 = new TagNode('div');
    const child3 = new TagNode('div');
    const child4 = new TagNode('div');
    NodeLogic.appendChild(root, parent);
    NodeLogic.appendChild(parent, child1);
    NodeLogic.appendChild(child1, child2);
    NodeLogic.appendChild(child1, child3);
    NodeLogic.appendChild(child1, child4);

    NodeLogic.replaceNode(child1, child1.childNodes);

    t.is(parent.parentNode, root);
    t.is(parent.childNodes.length, 3);
    t.falsy(child1.parentNode);
    t.falsy(child1.prevSibling);
    t.falsy(child1.nextSibling);
    t.is(child2.parentNode, parent);
    t.is(child3.parentNode, parent);
    t.is(child4.parentNode, parent);
    t.is(parent.firstChild, child2);
    t.is(parent.lastChild, child4);
    t.falsy(child2.prevSibling);
    t.is(child2.nextSibling, child3);
    t.is(child3.prevSibling, child2);
    t.is(child3.nextSibling, child4);
    t.is(child4.prevSibling, child3);
    t.falsy(child4.nextSibling);
});

test('NodeLogic.replaceNode will not insert a DocumentNode', t => {
    const parent = new TagNode('div');
    const child = new TagNode('div');
    const replace = new DocumentNode();
    NodeLogic.appendChild(parent, child);

    t.throws(() => NodeLogic.replaceNode(child, [ replace ]));
});

test('NodeLogic.cloneDocumentNode deep clones DOM correctly', t => {
    const root = new DocumentNode();
    const child1 = new TagNode('div', new Map([['hello', 'world']]));
    NodeLogic.appendChild(child1, new TagNode('div'));
    NodeLogic.appendChild(child1, new TagNode('div'));
    NodeLogic.appendChild(root, child1);
    const child2 = new TagNode('div', new Map([['child', '2']]));
    NodeLogic.appendChild(child2, new TagNode('div'));
    NodeLogic.appendChild(child2, new TagNode('div'));
    NodeLogic.appendChild(root, child2);

    const clone = NodeLogic.cloneDocumentNode(root, true);
    t.is(clone.childNodes.length, 2);
    
    const cloneChild1 = clone.firstChild as TagNode;
    t.true(TagNode.isTagNode(cloneChild1));
    t.is(cloneChild1.getAttribute('hello'), 'world');
    t.is(cloneChild1.childNodes.length, 2);
    t.true(TagNode.isTagNode(cloneChild1.firstChild as Node));
    t.true(TagNode.isTagNode(cloneChild1.lastChild as Node));

    const cloneChild2 = clone.lastChild as TagNode;
    t.true(TagNode.isTagNode(cloneChild2));
    t.is(cloneChild2.getAttribute('child'), '2');
    t.is(cloneChild2.childNodes.length, 2);
    t.true(TagNode.isTagNode(cloneChild2.firstChild as Node));
    t.true(TagNode.isTagNode(cloneChild2.lastChild as Node));
});

test('NodeLogic.cloneDocumentNode shallow clones DOM correctly', t => {
    const root = new DocumentNode();
    const child1 = new TagNode('div', new Map([['hello', 'world']]));
    NodeLogic.appendChild(root, child1);
    const child2 = new TagNode('div', new Map([['child', '2']]));
    NodeLogic.appendChild(root, child2);

    const clone = NodeLogic.cloneDocumentNode(root, false);
    t.is(clone.childNodes.length, 0);
});

test('NodeLogic.cloneDocumentNode fires callbacks', t => {
    const root = new DocumentNode();
    const child1 = new TagNode('div', new Map([['hello', 'world']]));
    NodeLogic.appendChild(root, child1);
    const child1child1 = new TagNode('div');
    NodeLogic.appendChild(child1, child1child1);
    const child1child2 = new TagNode('div');
    NodeLogic.appendChild(child1, child1child2);
    const child2 = new TagNode('div', new Map([['child', '2']]));
    NodeLogic.appendChild(root, child2);
    const child2child1 = new TagNode('div');
    NodeLogic.appendChild(child2, child2child1);
    const child2child2 = new TagNode('div');
    NodeLogic.appendChild(child2, child2child2);

    const clonedNodes: Node[] = [];
    NodeLogic.cloneDocumentNode(root, true, (oldNode: Node, newNode: Node) => {
        t.is(newNode.nodeType, oldNode.nodeType);
        t.not(newNode, oldNode);
        clonedNodes.push(oldNode);
    });

    t.is(clonedNodes.length, 7);
    t.true(clonedNodes.includes(root));
    t.true(clonedNodes.includes(child1));
    t.true(clonedNodes.includes(child1child1));
    t.true(clonedNodes.includes(child1child2));
    t.true(clonedNodes.includes(child2));
    t.true(clonedNodes.includes(child2child1));
    t.true(clonedNodes.includes(child2child2));
});

test('NodeLogic.getChildTags filters for TagNodes', t => {
    const root = new DocumentNode();
    root.appendChild(new TextNode('text'));
    const child1 = new TagNode('div');
    root.appendChild(child1);
    root.appendChild(new TextNode('text'));
    const child2 = new TagNode('div');
    root.appendChild(child2);
    root.appendChild(new TextNode('text'));

    const childTags = NodeLogic.getChildTags(root);
    t.is(childTags.length, 2);
    t.true(childTags.includes(child1));
    t.true(childTags.includes(child2));
});

test('NodeLogic.getPreviousTag finds previous tag', t => {
    const root = new DocumentNode();
    const tag1 = new TagNode('div');
    const text1 = new TextNode('text1');
    const text2 = new TextNode('text2');
    const tag2 = new TagNode('div');
    NodeLogic.appendChildNodes(root, [tag1, text1, text2, tag2]);

    const prevTag = NodeLogic.getPreviousTag(tag2);
    t.is(prevTag, tag1);
});

test('NodeLogic.getPreviousTag returns null if no tags found', t => {
    const root = new DocumentNode();
    const text1 = new TextNode('text1');
    const text2 = new TextNode('text2');
    const tag = new TagNode('div');
    NodeLogic.appendChildNodes(root, [text1, text2, tag]);
    
    const prevTag = NodeLogic.getPreviousTag(tag);
    t.is(prevTag, null);
});

test('NodeLogic.getNextTag finds next tag', t => {
    const root = new DocumentNode();
    const tag1 = new TagNode('div');
    const text1 = new TextNode('text1');
    const text2 = new TextNode('text2');
    const tag2 = new TagNode('div');
    NodeLogic.appendChildNodes(root, [tag1, text1, text2, tag2]);

    const nextTag = NodeLogic.getNextTag(tag1);
    t.is(nextTag, tag2);
});

test('NodeLogic.getNextTag returns null if no tags found', t => {
    const root = new DocumentNode();
    const tag = new TagNode('div');
    const text1 = new TextNode('text1');
    const text2 = new TextNode('text2');
    NodeLogic.appendChildNodes(root, [tag, text1, text2]);
    
    const nextTag = NodeLogic.getNextTag(tag);
    t.is(nextTag, null);
});

// getFirstTag()
test('NodeLogic.getFirstTag() includes the very first node', t => {
    const tag = new TagNode('div');
    t.is(NodeLogic.getFirstTag([ tag ]), tag);
});
test('NodeLogic.getFirstTag() finds the first tag', t => {
    const tag = new TagNode('div');
    t.is(NodeLogic.getFirstTag([ new TextNode(), tag, new TextNode(), new TagNode('div') ]), tag);
});
test('NodeLogic.getFirstTag() returns null if no tags found', t => {
    t.is(NodeLogic.getFirstTag([ new TextNode(), new TextNode() ]), null);
});

// getLastTag()
test('NodeLogic.getLastTag() includes the very last node', t => {
    const tag = new TagNode('div');
    t.is(NodeLogic.getLastTag([ tag ]), tag);
});
test('NodeLogic.getLastTag() finds the last tag', t => {
    const tag = new TagNode('div');
    t.is(NodeLogic.getLastTag([ new TagNode('div'), new TextNode(), tag, new TextNode() ]), tag);
});
test('NodeLogic.getLastTag() returns null if no tags found', t => {
    t.is(NodeLogic.getLastTag([ new TextNode(), new TextNode() ]), null);
});

// getFirstText()
test('NodeLogic.getFirstText() includes the very first node', t => {
    const text = new TextNode();
    t.is(NodeLogic.getFirstText([ text ]), text);
});
test('NodeLogic.getFirstText() finds the first text', t => {
    const text = new TextNode();
    t.is(NodeLogic.getFirstText([ new TagNode('div'), text, new TagNode('div'), new TextNode() ]), text);
});
test('NodeLogic.getFirstText() returns null if no text found', t => {
    t.is(NodeLogic.getFirstText([ new TagNode('div'), new TagNode('div') ]), null);
});

// getLastText()
test('NodeLogic.getLastText() includes the very last node', t => {
    const text = new TextNode();
    t.is(NodeLogic.getLastText([ text ]), text);
});
test('NodeLogic.getLastText() finds the last text', t => {
    const text = new TextNode();
    t.is(NodeLogic.getLastText([  new TextNode(), new TagNode('div'), text, new TagNode('div') ]), text);
});
test('NodeLogic.getLastText() returns null if no text found', t => {
    t.is(NodeLogic.getLastText([ new TagNode('div'), new TagNode('div') ]), null);
});

// getPreviousTag()
test('NodeLogic.getPreviousTag() includes the very first previous sibling', t => {
    const tag = new TagNode('div');
    const root = new TagNode('div');
    root.prependSibling(tag);
    t.is(NodeLogic.getPreviousTag(root), tag);
});
test('NodeLogic.getPreviousTag() finds the first previous tag', t => {
    const tag = new TagNode('div');
    const text = new TextNode();
    const root = new TagNode('div');
    root.prependSibling(text);
    text.prependSibling(tag);
    t.is(NodeLogic.getPreviousTag(root), tag);
});
test('NodeLogic.getPreviousTag() returns null if none found', t => {
    const text = new TextNode();
    const root = new TagNode('div');
    root.prependSibling(text);
    t.is(NodeLogic.getPreviousTag(root), null);
});

// getNextTag()
test('NodeLogic.getNextTag() includes the very first next sibling', t => {
    const tag = new TagNode('div');
    const root = new TagNode('div');
    root.appendSibling(tag);
    t.is(NodeLogic.getNextTag(root), tag);
});
test('NodeLogic.getNextTag() finds the first next tag', t => {
    const tag = new TagNode('div');
    const text = new TextNode();
    const root = new TagNode('div');
    root.appendSibling(text);
    text.appendSibling(tag);
    t.is(NodeLogic.getNextTag(root), tag);
});
test('NodeLogic.getNextTag() returns null if none found', t => {
    const text = new TextNode();
    const root = new TagNode('div');
    root.prependSibling(text);
    t.is(NodeLogic.getNextTag(root), null);
});

// getPreviousText()
test('NodeLogic.getPreviousText() includes the very first previous sibling', t => {
    const text = new TextNode();
    const root = new TagNode('div');
    root.prependSibling(text);
    t.is(NodeLogic.getPreviousText(root), text);
});
test('NodeLogic.getPreviousText() finds the first previous text', t => {
    const text = new TextNode();
    const tag = new TagNode('div');
    const root = new TagNode('div');
    root.prependSibling(tag);
    tag.prependSibling(text);
    t.is(NodeLogic.getPreviousText(root), text);
});
test('NodeLogic.getPreviousText() returns null if none found', t => {
    const tag = new TagNode('div');
    const root = new TagNode('div');
    root.appendSibling(tag);
    t.is(NodeLogic.getPreviousText(root), null);
});

// getNextText()
test('NodeLogic.getNextText() includes the very first next sibling', t => {
    const text = new TextNode();
    const root = new TagNode('div');
    root.appendSibling(text);
    t.is(NodeLogic.getNextText(root), text);
});
test('NodeLogic.getNextText() finds the first next tex', t => {
    const text = new TextNode();
    const tag = new TagNode('div');
    const root = new TagNode('div');
    root.appendSibling(tag);
    tag.appendSibling(text);
    t.is(NodeLogic.getNextText(root), text);
});
test('NodeLogic.getNextText() returns null if none found', t => {
    const tag = new TagNode('div');
    const root = new TagNode('div');
    root.appendSibling(tag);
    t.is(NodeLogic.getPreviousText(root), null);
});

// findNextNode()
test('findNextNode() finds immediate next', t => {
    const first = new TagNode('first');
    const next = new TagNode('next');
    new DocumentNode().appendChildren([ first, next ]);

    t.is(first.findNext(node => TagNode.isTagNode(node) && node.tagName === 'next'), next);
});
test('findNextNode() skips non-matched', t => {
    const first = new TagNode('first');
    const wrong = new TagNode('wrong');
    const right = new TagNode('right');
    new DocumentNode().appendChildren([ first, wrong, right ]);

    t.is(first.findNext(node => TagNode.isTagNode(node) && node.tagName === 'right'), right);
});
test('findNextNode() ignores self', t => {
    const first = new TagNode('tag');
    const right = new TagNode('tag');
    new DocumentNode().appendChildren([ first, right ]);

    t.is(first.findNext(node => TagNode.isTagNode(node) && node.tagName === 'tag'), right);
});
test('findNextNode() ignores previous', t => {
    const wrong = new TagNode('tag');
    const first = new TagNode('first');
    const right = new TagNode('tag');
    new DocumentNode().appendChildren([ wrong, first, right ]);

    t.is(first.findNext(node => TagNode.isTagNode(node) && node.tagName === 'tag'), right);
});
test('findNextNode() returns null on no match', t => {
    const first = new TagNode('first');
    const wrong = new TagNode('wrong');
    new DocumentNode().appendChildren([ first, wrong ]);

    t.is(first.findNext(node => TagNode.isTagNode(node) && node.tagName === 'right'), null);
});
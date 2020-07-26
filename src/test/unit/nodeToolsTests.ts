import test from 'ava';
import { NodeTools, TagNode, DocumentNode, Node, TextNode } from '../../lib';

test('[unit] NodeTools.detatchNode removes nodes', t => {
    const parent = new TagNode('div');
    const child = new TagNode('div');
    NodeTools.appendChild(parent, child);
    NodeTools.detatchNode(child);

    t.falsy(child.parentNode);
    t.falsy(child.nextSibling);
    t.falsy(child.prevSibling);
    t.falsy(parent.firstChild);
    t.falsy(parent.lastChild);
    t.false(parent.childNodes.includes(child));
    t.falsy(Object.getPrototypeOf(child.nodeData));
    t.is(parent.childNodes.length, 0);
});

test('[unit] NodeTools.hasChild detects children', t => {
    const parent = new TagNode('div');
    const child = new TagNode('div');
    const notChild = new TagNode('div');
    NodeTools.appendChild(parent, child);

    t.true(NodeTools.hasChild(parent, child));
    t.false(NodeTools.hasChild(parent, notChild));
});

test('[unit] NodeTools.appendChild appends children', t => {
    const parent = new TagNode('div');
    const child1 = new TagNode('div');
    const child2 = new TagNode('div');
    NodeTools.appendChild(parent, child1);
    NodeTools.appendChild(parent, child2);

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

test('[unit] NodeTools.appendChild will not append a DocumentNode', t => {
    const parent = new TagNode('div');
    const child = new DocumentNode();

    t.throws(() => NodeTools.appendChild(parent, child));
});

test('[unit] NodeTools.prependChild inserts children', t => {
    const parent = new TagNode('div');
    const child1 = new TagNode('div');
    const child2 = new TagNode('div');
    NodeTools.prependChild(parent, child1);
    NodeTools.prependChild(parent, child2);

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

test('[unit] NodeTools.prependChild will not prepend a DocumentNode', t => {
    const parent = new TagNode('div');
    const child = new DocumentNode();

    t.throws(() => NodeTools.prependChild(parent, child));
});

test('[unit] NodeTools.clear removes all child nodes', t => {
    const parent = new TagNode('div');
    const child1 = new TagNode('div');
    const child2 = new TagNode('div');
    NodeTools.appendChild(parent, child1);
    NodeTools.appendChild(parent, child2);
    NodeTools.clear(parent);

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

test('[unit] NodeTools.appendChildNodes appends all child nodes', t => {
    const parent = new TagNode('div');
    const child1 = new TagNode('div');
    const child2 = new TagNode('div');
    NodeTools.appendChildNodes(parent, [ child1, child2 ]);

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

test('[unit] NodeTools.appendChildNodes will not append a DocumentNode', t => {
    const parent = new TagNode('div');
    const child = new DocumentNode();

    t.throws(() => NodeTools.appendChildNodes(parent, [ child ]));
});

test('[unit] NodeTools.appendSibling appends sibling', t => {
    const parent = new TagNode('div');
    const child1 = new TagNode('div');
    const child2 = new TagNode('div');
    NodeTools.appendChild(parent, child1);
    NodeTools.appendSibling(child2, child1);
    
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

test('[unit] NodeTools.appendSibling will not append a DocumentNode', t => {
    const parent = new TagNode('div');
    const child1 = new TagNode('div');
    const child2 = new DocumentNode();
    NodeTools.appendChild(parent, child1);

    t.throws(() => NodeTools.appendSibling(child2, child1));
});

test('[unit] NodeTools.prependSibling inserts sibling', t => {
    const parent = new TagNode('div');
    const child1 = new TagNode('div');
    const child2 = new TagNode('div');
    NodeTools.appendChild(parent, child1);
    NodeTools.prependSibling(child2, child1);

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

test('[unit] NodeTools.prependSibling will not append a DocumentNode', t => {
    const parent = new TagNode('div');
    const child1 = new TagNode('div');
    const child2 = new DocumentNode();
    NodeTools.appendChild(parent, child1);

    t.throws(() => NodeTools.prependSibling(child2, child1));
});

test('[unit] NodeTools.replaceNode works with no replacements', t => {
    const root = new TagNode('div');
    const parent = new TagNode('div');
    const child1 = new TagNode('div');
    NodeTools.appendChild(root, parent);
    NodeTools.appendChild(parent, child1);

    NodeTools.replaceNode(child1, []);

    t.falsy(child1.parentNode);
    t.falsy(child1.prevSibling);
    t.falsy(child1.nextSibling);
    t.is(parent.childNodes.length, 0);
    t.is(parent.parentNode, root);
});

test('[unit] NodeTools.replaceNode works with one replacement', t => {
    const root = new TagNode('div');
    const parent = new TagNode('div');
    const child1 = new TagNode('div');
    const child2 = new TagNode('div');
    NodeTools.appendChild(root, parent);
    NodeTools.appendChild(parent, child1);

    NodeTools.replaceNode(child1, [ child2 ]);

    t.is(parent.parentNode, root);
    t.is(parent.childNodes.length, 1);
    t.falsy(child1.parentNode);
    t.falsy(child1.prevSibling);
    t.falsy(child1.nextSibling);
    t.is(child2.parentNode, parent);
});

test('[unit] NodeTools.replaceNode works with multiple replacements', t => {
    const root = new TagNode('div');
    const parent = new TagNode('div');
    const child1 = new TagNode('div');
    const child2 = new TagNode('div');
    const child3 = new TagNode('div');
    const child4 = new TagNode('div');
    NodeTools.appendChild(root, parent);
    NodeTools.appendChild(parent, child1);

    NodeTools.replaceNode(child1, [ child2, child3, child4 ]);

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

test('[unit] NodeTools.replaceNode works with neighbors', t => {
    const root = new TagNode('div');
    const parent = new TagNode('div');
    const child1 = new TagNode('div');
    const child2 = new TagNode('div');
    const child3 = new TagNode('div');
    const child4 = new TagNode('div');
    NodeTools.appendChild(root, parent);
    NodeTools.appendChild(parent, child1);
    NodeTools.appendChild(parent, child2);
    NodeTools.appendChild(parent, child3);

    NodeTools.replaceNode(child2, [ child4 ]);
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

test('[unit] NodeTools.replaceNode can promote child nodes', t => {
    const root = new TagNode('div');
    const parent = new TagNode('div');
    const child1 = new TagNode('div');
    const child2 = new TagNode('div');
    const child3 = new TagNode('div');
    const child4 = new TagNode('div');
    NodeTools.appendChild(root, parent);
    NodeTools.appendChild(parent, child1);
    NodeTools.appendChild(child1, child2);
    NodeTools.appendChild(child1, child3);
    NodeTools.appendChild(child1, child4);

    NodeTools.replaceNode(child1, child1.childNodes);

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

test('[unit] NodeTools.replaceNode will not insert a DocumentNode', t => {
    const parent = new TagNode('div');
    const child = new TagNode('div');
    const replace = new DocumentNode();
    NodeTools.appendChild(parent, child);

    t.throws(() => NodeTools.replaceNode(child, [ replace ]));
});

test('[unit] NodeTools.cloneDocumentNode deep clones DOM correctly', t => {
    const root = new DocumentNode();
    const child1 = new TagNode('div', new Map([['hello', 'world']]));
    NodeTools.appendChild(child1, new TagNode('div'));
    NodeTools.appendChild(child1, new TagNode('div'));
    NodeTools.appendChild(root, child1);
    const child2 = new TagNode('div', new Map([['child', '2']]));
    NodeTools.appendChild(child2, new TagNode('div'));
    NodeTools.appendChild(child2, new TagNode('div'));
    NodeTools.appendChild(root, child2);

    const clone = NodeTools.cloneDocumentNode(root, true);
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

test('[unit] NodeTools.cloneDocumentNode shallow clones DOM correctly', t => {
    const root = new DocumentNode();
    const child1 = new TagNode('div', new Map([['hello', 'world']]));
    NodeTools.appendChild(root, child1);
    const child2 = new TagNode('div', new Map([['child', '2']]));
    NodeTools.appendChild(root, child2);

    const clone = NodeTools.cloneDocumentNode(root, false);
    t.is(clone.childNodes.length, 0);
});

test('[unit] NodeTools.cloneDocumentNode fires callbacks', t => {
    const root = new DocumentNode();
    const child1 = new TagNode('div', new Map([['hello', 'world']]));
    NodeTools.appendChild(root, child1);
    const child1child1 = new TagNode('div');
    NodeTools.appendChild(child1, child1child1);
    const child1child2 = new TagNode('div');
    NodeTools.appendChild(child1, child1child2);
    const child2 = new TagNode('div', new Map([['child', '2']]));
    NodeTools.appendChild(root, child2);
    const child2child1 = new TagNode('div');
    NodeTools.appendChild(child2, child2child1);
    const child2child2 = new TagNode('div');
    NodeTools.appendChild(child2, child2child2);

    const clonedNodes: Node[] = [];
    NodeTools.cloneDocumentNode(root, true, (oldNode: Node, newNode: Node) => {
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

test('[unit] NodeTools.getChildTags filters for TagNodes', t => {
    const root = new DocumentNode();
    root.appendChild(new TextNode('text'));
    const child1 = new TagNode('div');
    root.appendChild(child1);
    root.appendChild(new TextNode('text'));
    const child2 = new TagNode('div');
    root.appendChild(child2);
    root.appendChild(new TextNode('text'));

    const childTags = NodeTools.getChildTags(root);
    t.is(childTags.length, 2);
    t.true(childTags.includes(child1));
    t.true(childTags.includes(child2));
});

test('[unit] NodeTools.getPreviousTag finds previous tag', t => {
    const root = new DocumentNode();
    const tag1 = new TagNode('div');
    const text1 = new TextNode('text1');
    const text2 = new TextNode('text2');
    const tag2 = new TagNode('div');
    NodeTools.appendChildNodes(root, [tag1, text1, text2, tag2]);

    const prevTag = NodeTools.getPreviousTag(tag2);
    t.is(prevTag, tag1);
});

test('[unit] NodeTools.getPreviousTag returns null if no tags found', t => {
    const root = new DocumentNode();
    const text1 = new TextNode('text1');
    const text2 = new TextNode('text2');
    const tag = new TagNode('div');
    NodeTools.appendChildNodes(root, [text1, text2, tag]);
    
    const prevTag = NodeTools.getPreviousTag(tag);
    t.is(prevTag, null);
});

test('[unit] NodeTools.getNextTag finds next tag', t => {
    const root = new DocumentNode();
    const tag1 = new TagNode('div');
    const text1 = new TextNode('text1');
    const text2 = new TextNode('text2');
    const tag2 = new TagNode('div');
    NodeTools.appendChildNodes(root, [tag1, text1, text2, tag2]);

    const nextTag = NodeTools.getNextTag(tag1);
    t.is(nextTag, tag2);
});

test('[unit] NodeTools.getNextTag returns null if no tags found', t => {
    const root = new DocumentNode();
    const tag = new TagNode('div');
    const text1 = new TextNode('text1');
    const text2 = new TextNode('text2');
    NodeTools.appendChildNodes(root, [tag, text1, text2]);
    
    const nextTag = NodeTools.getNextTag(tag);
    t.is(nextTag, null);
});

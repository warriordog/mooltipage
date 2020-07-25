import test from 'ava';
import { NodeTools, TagNode } from '../../lib';

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

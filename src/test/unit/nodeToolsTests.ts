import test from 'ava';
import { NodeTools, Node, NodeWithChildren, TagNode } from '../../lib';

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
});

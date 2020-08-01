import test from 'ava';
import { DocumentNode, TextNode } from '../../lib';
import * as NodeLogic from '../../lib/dom/nodeLogic';

test('[unit] Node.nodeData can store data', t => {
    const node = new DocumentNode();

    node.nodeData.test = 'testvalue';

    t.is(node.nodeData.test, 'testvalue');
});

test('[unit] Node.nodeData is inherited', t => {
    const parent = new DocumentNode();
    const child = new TextNode();
    NodeLogic.appendChild(parent, child);

    parent.nodeData.test = 'testvalue';

    t.is(parent.nodeData.test, 'testvalue');
    t.is(child.nodeData.test, 'testvalue');
});

test('[unit] Node.nodeData is isolate from children', t => {
    const parent = new DocumentNode();
    const child = new TextNode();
    NodeLogic.appendChild(parent, child);

    child.nodeData.test = 'testvalue';

    t.falsy(parent.nodeData.test);
    t.is(child.nodeData.test, 'testvalue');
});

test('[unit] Node.nodeData is preserved when node is moved', t => {
    const parent1 = new DocumentNode();
    const parent2 = new DocumentNode();
    const child = new TextNode();
    NodeLogic.appendChild(parent1, child);

    child.nodeData.test = 'testvalue';
    NodeLogic.appendChild(parent2, child);

    t.is(child.nodeData.test, 'testvalue');
});
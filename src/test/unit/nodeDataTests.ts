import test from 'ava';
import { DocumentNode, TextNode } from '../../lib';
import * as NodeLogic from '../../lib/dom/nodeLogic';

test('Node.nodeData can store data', t => {
    const node = new DocumentNode();

    node.nodeData.test = 'testValue';

    t.is(node.nodeData.test, 'testValue');
});

test('Node.nodeData is inherited', t => {
    const parent = new DocumentNode();
    const child = new TextNode();
    NodeLogic.appendChild(parent, child);

    parent.nodeData.test = 'testValue';

    t.is(parent.nodeData.test, 'testValue');
    t.is(child.nodeData.test, 'testValue');
});

test('Node.nodeData is isolate from children', t => {
    const parent = new DocumentNode();
    const child = new TextNode();
    NodeLogic.appendChild(parent, child);

    child.nodeData.test = 'testValue';

    t.falsy(parent.nodeData.test);
    t.is(child.nodeData.test, 'testValue');
});

test('Node.nodeData is preserved when node is moved', t => {
    const parent1 = new DocumentNode();
    const parent2 = new DocumentNode();
    const child = new TextNode();
    NodeLogic.appendChild(parent1, child);

    child.nodeData.test = 'testValue';
    NodeLogic.appendChild(parent2, child);

    t.is(child.nodeData.test, 'testValue');
});
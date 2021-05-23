import test from 'ava';
import { MockPipeline } from '../../_mocks/mockPipeline';
import {
    Node,
    DocumentNode,
    TagNode,
    MVarNode,
    MScopeNode,
    Fragment,
    MDataNode,
    MimeType,
    ScopeData
} from '../../../lib';
import { HtmlCompilerContext } from '../../../lib/pipeline/module/htmlCompiler';
import {
    saveCompiledAttributeToScope,
    VarModule
} from '../../../lib/pipeline/module/compiler/varModule';
import * as NodeLogic from '../../../lib/dom/nodeLogic';

async function runVarModule(node: Node, cleanup = true, fragmentScope: ScopeData = {}, pipeline = new MockPipeline()): Promise<void> {
    const testFrag: Fragment = {
        path: 'page.html',
        dom: new DocumentNode()
    };

    const htmlContext = new HtmlCompilerContext(
        {
            pipeline: pipeline,
            fragment: testFrag,
            fragmentContext: {
                slotContents: new Map(),
                scope: fragmentScope,
                fragmentResPath: testFrag.path,
                rootResPath: testFrag.path
            },
            stylesInPage: new Set(),
            linksInPage: new Set()
        }, node);
    const varModule = new VarModule();

    await varModule.enterNode(htmlContext);

    if (cleanup && !htmlContext.isDeleted) {
        varModule.exitNode(htmlContext);
    }
}

test('VarModule does not affect standard elements', async t => {
    const parent = new TagNode('div');
    const child = new TagNode('div');
    NodeLogic.appendChild(parent, child);

    await runVarModule(child);

    t.is(child.parentNode, parent);
});

test('VarModule loads root scope into document', async t => {
    const dom = new DocumentNode();

    await runVarModule(dom, true, {
        test: 123
    });

    t.is(dom.nodeData.test, 123);
});

test('VarModule loads m-var into the parent scope', async t => {
    const parent = new TagNode('div');
    const childVar = new MVarNode(new Map([['test', 123]]));
    const childDiv = new TagNode('div');
    NodeLogic.appendChild(parent, childVar);
    NodeLogic.appendChild(parent, childDiv);

    await runVarModule(childVar);

    t.is(parent.nodeData.test, 123);
    t.is(childDiv.nodeData.test, 123);
});

test('VarModule removes m-var after processing', async t => {
    const parent = new TagNode('div');
    const childVar = new MVarNode(new Map([['test', 123]]));
    const childDiv = new TagNode('div');
    NodeLogic.appendChild(parent, childVar);
    NodeLogic.appendChild(parent, childDiv);

    await runVarModule(childVar);

    t.falsy(childVar.parentNode);
    t.false(parent.childNodes.includes(childVar));
});

test('VarModule loads m-scope into its own scope', async t => {
    const parent = new TagNode('div');
    const childScope = new MScopeNode(new Map([['test', 123]]));
    const childDivOuter = new TagNode('div');
    const childDivInner = new TagNode('div');
    NodeLogic.appendChild(parent, childScope);
    NodeLogic.appendChild(parent, childDivOuter);
    NodeLogic.appendChild(childScope, childDivInner);

    await runVarModule(childScope, false);

    t.falsy(parent.nodeData.test);
    t.falsy(childDivOuter.nodeData.test);
    t.is(childDivInner.nodeData.test, 123);
});

test('VarModule removes m-scope after processing', async t => {
    const parent = new TagNode('div');
    const childScope = new MScopeNode(new Map([['test', 123]]));
    const childDivOuter = new TagNode('div');
    const childDivInner = new TagNode('div');
    NodeLogic.appendChild(parent, childScope);
    NodeLogic.appendChild(parent, childDivOuter);
    NodeLogic.appendChild(childScope, childDivInner);

    await runVarModule(childScope);

    t.falsy(childScope.parentNode);
    t.false(parent.childNodes.includes(childScope));
    t.is(childDivInner.parentNode, parent);
    t.is(childDivOuter.parentNode, parent);

    // scope vars are lost after it is deleted
    t.falsy(parent.nodeData.test);
    t.falsy(childDivInner.nodeData.test);
    t.falsy(childDivOuter.nodeData.test);
});

test('VarModule handles m-var with null attributes', async t => {
    const parent = new DocumentNode();
    const mVar = new MVarNode();
    mVar.setRawAttribute('test', null);
    parent.appendChild(mVar);

    await runVarModule(mVar);

    t.true(mVar.hasAttribute('test'));
    t.is(mVar.getRawAttribute('test'), null);
});

test('VarModule handles m-scope with null attributes', async t => {
    const mScope = new MScopeNode();
    mScope.setRawAttribute('test', null);

    await runVarModule(mScope);

    t.true(mScope.hasAttribute('test'));
    t.is(mScope.getRawAttribute('test'), null);
});

test('VarModule removes <m-data>', async t => {
    const mData = new MDataNode(MimeType.TEXT);

    const root = new DocumentNode();
    root.appendChild(mData);

    await runVarModule(mData);

    t.falsy(mData.parentNode);
});

test('VarModule compiles text', async t => {
    const dataType = MimeType.TEXT;
    const dataValue = 'Test text';
    const dataVar = 'test';

    const mData = new MDataNode(dataType);
    mData.setAttribute(dataVar, 'text.txt');

    const root = new DocumentNode();
    root.appendChild(mData);

    const pipe = new MockPipeline();
    pipe.mockRawTexts.push(['text.txt', dataType, dataValue]);

    await runVarModule(mData, undefined, undefined, pipe);

    t.is(root.nodeData[dataVar], dataValue);
});

test('VarModule compiles json', async t => {
    const dataType = MimeType.JSON;
    const dataValue = '{ "testValue": "value" }';
    const dataVar = 'test';

    const mData = new MDataNode(dataType);
    mData.setAttribute(dataVar, 'json.json');

    const root = new DocumentNode();
    root.appendChild(mData);

    const pipe = new MockPipeline();
    pipe.mockRawTexts.push(['json.json', dataType, dataValue]);

    await runVarModule(mData, undefined, undefined, pipe);

    const outValue = root.nodeData[dataVar] as Record<string, unknown>;
    t.truthy(outValue);
    t.is(outValue.testValue, 'value');
});

test('VarModule compiles multiple data', async t => {
    const mData = new MDataNode(MimeType.JSON);
    mData.setAttribute('test1', 'test1.json');
    mData.setAttribute('test2', 'test2.json');

    const root = new DocumentNode();
    root.appendChild(mData);

    const pipe = new MockPipeline();
    pipe.mockRawTexts.push(['test1.json', MimeType.JSON, '{ "testValue": "value1" }']);
    pipe.mockRawTexts.push(['test2.json', MimeType.JSON, '{ "testValue": "value2" }']);

    await runVarModule(mData, undefined, undefined, pipe);

    const test1 = root.nodeData.test1 as Record<string, unknown>;
    t.truthy(test1);
    t.is(test1.testValue, 'value1');

    const test2 = root.nodeData.test2 as Record<string, unknown>;
    t.truthy(test2);
    t.is(test2.testValue, 'value2');
});

test('VarModule.saveCompiledAttributeToScope() saves to scope', t => {
    const scope: ScopeData = {};

    saveCompiledAttributeToScope(scope, 'key1', 'value1');
    saveCompiledAttributeToScope(scope, 'key2', 2);

    t.is(scope.key1, 'value1');
    t.is(scope.key2, 2);
});

test('VarModule.saveCompiledAttributeToScope() converts case', t => {
    const scope: ScopeData = {};

    saveCompiledAttributeToScope(scope, 'key-name-1', 'value1');

    t.is(scope.keyName1, 'value1');
});
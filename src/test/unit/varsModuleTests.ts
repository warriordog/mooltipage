import test from 'ava';
import { NodeTools, DocumentNode, VarsModule, TagNode, HtmlCompileData, Fragment, UsageContext, Page, Node, EvalVars, EvalKey, MVarNode, MScopeNode } from '../../lib';
import { MockPipeline } from '../_mocks/mockPipeline';

function runVarsModule(node: Node, cleanup = true, fragmentParams?: EvalVars) {
    const pipeline = new MockPipeline();
    const page = new Page('page.html', new DocumentNode());
    const fragment = new Fragment(page.resPath, page.dom);
    const usageContext = new UsageContext(page, undefined, fragmentParams);

    const compileData = new HtmlCompileData(pipeline, fragment, usageContext, node);
    const varsModule = new VarsModule();

    varsModule.enterNode(compileData);

    if (cleanup && !compileData.isDeleted) {
        varsModule.exitNode(compileData);
    }
}

test('[unit] VarsModule does not affect standard elements', t => {
    const parent = new TagNode('div');
    const child = new TagNode('div');
    NodeTools.appendChild(parent, child);

    runVarsModule(child);

    t.is(child.parentNode, parent);
});

test('[unit] VarsModule loads root scope into document', t => {
    const params = new Map<EvalKey, unknown>();
    params.set('test', 123);

    const dom = new DocumentNode();

    runVarsModule(dom, true, params);

    t.is(dom.nodeData.test, 123);
});

test('[unit] VarsModule loads m-var into the parent scope', t => {
    const parent = new TagNode('div');
    const childVar = new MVarNode(new Map([['test', 123]]));
    const childDiv = new TagNode('div');
    NodeTools.appendChild(parent, childVar);
    NodeTools.appendChild(parent, childDiv);

    runVarsModule(childVar);

    t.is(parent.nodeData.test, 123);
    t.is(childDiv.nodeData.test, 123);
});

test('[unit] VarsModule removes m-var after processing', t => {
    const parent = new TagNode('div');
    const childVar = new MVarNode(new Map([['test', 123]]));
    const childDiv = new TagNode('div');
    NodeTools.appendChild(parent, childVar);
    NodeTools.appendChild(parent, childDiv);

    runVarsModule(childVar);

    t.falsy(childVar.parentNode);
    t.false(parent.childNodes.includes(childVar));
});

test('[unit] VarsModule loads m-scope into its own scope', t => {
    const parent = new TagNode('div');
    const childScope = new MScopeNode(new Map([['test', 123]]));
    const childDivOuter = new TagNode('div');
    const childDivInner = new TagNode('div');
    NodeTools.appendChild(parent, childScope);
    NodeTools.appendChild(parent, childDivOuter);
    NodeTools.appendChild(childScope, childDivInner);

    runVarsModule(childScope, false);

    t.falsy(parent.nodeData.test);
    t.falsy(childDivOuter.nodeData.test);
    t.is(childDivInner.nodeData.test, 123);
});

test('[unit] VarsModule removes m-scope after processing', t => {
    const parent = new TagNode('div');
    const childScope = new MScopeNode(new Map([['test', 123]]));
    const childDivOuter = new TagNode('div');
    const childDivInner = new TagNode('div');
    NodeTools.appendChild(parent, childScope);
    NodeTools.appendChild(parent, childDivOuter);
    NodeTools.appendChild(childScope, childDivInner);

    runVarsModule(childScope);

    t.falsy(childScope.parentNode);
    t.false(parent.childNodes.includes(childScope));
    t.is(childDivInner.parentNode, parent);
    t.is(childDivOuter.parentNode, parent);

    // scope vars are lost after it is deleted
    t.falsy(parent.nodeData.test);
    t.falsy(childDivInner.nodeData.test);
    t.falsy(childDivOuter.nodeData.test);
});
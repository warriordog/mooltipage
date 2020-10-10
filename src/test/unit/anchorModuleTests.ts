import test
    from 'ava';
import {
    AnchorNodeResolve,
    CompiledAnchorNode,
    DocumentNode,
    Node,
    UncompiledAnchorNode
} from '../../lib';
import {
    compileAnchorNode,
    resolveAnchorHref,
    resolveAnchorHrefBase,
    resolveAnchorHrefLocal,
    resolveAnchorHrefRoot
} from '../../lib/pipeline/module/compiler/anchorModule';
import {
    MockHtmlCompilerContext,
    MockPipelineContext,
    MockSharedHtmlCompilerContext
} from '../_mocks/mockHtmlCompilerContext';
import {fixPathSeparators} from '../../lib/fs/pathUtils';


// compileAnchorNode()

test('AnchorModule.compileAnchorNode() replaces with UncompiledAnchorNode', t => {
    const root = new DocumentNode();
    const anchor = new CompiledAnchorNode('path.html', AnchorNodeResolve.NONE);
    root.appendChild(anchor);

    const htmlContext = new MockHtmlCompilerContext(anchor);
    compileAnchorNode(anchor, htmlContext);

    t.true(htmlContext.isDeleted);
    t.is(anchor.parentNode, null);
    t.truthy(root.firstChild);
    t.true(UncompiledAnchorNode.isUncompiledAnchorNode(root.firstChild as Node));
});

test('AnchorModule.compileAnchorNode() resolves AnchorNodeResolve.NONE', t => {
    const root = new DocumentNode();
    const anchor = new CompiledAnchorNode('path.html', AnchorNodeResolve.NONE);
    root.appendChild(anchor);

    const htmlContext = new MockHtmlCompilerContext(anchor);
    compileAnchorNode(anchor, htmlContext);

    t.truthy(root.firstChild);
    t.true(UncompiledAnchorNode.isUncompiledAnchorNode(root.firstChild as Node));

    const uncompiled = root.firstChild as UncompiledAnchorNode;
    t.true(uncompiled.hasAttribute('href'));
    t.is(fixPathSeparators(uncompiled.getRequiredValueAttribute('href')), 'path.html');
});

test('AnchorModule.compileAnchorNode() resolves AnchorNodeResolve.LOCAL', t => {
    const root = new DocumentNode();
    const anchor = new CompiledAnchorNode('path.html', AnchorNodeResolve.LOCAL);
    root.appendChild(anchor);

    const htmlContext = new MockHtmlCompilerContext(anchor, new MockSharedHtmlCompilerContext(new MockPipelineContext({
        dom: new DocumentNode(),
        path: fixPathSeparators('root/fragment.html')
    })));
    compileAnchorNode(anchor, htmlContext);

    t.truthy(root.firstChild);
    t.true(UncompiledAnchorNode.isUncompiledAnchorNode(root.firstChild as Node));

    const uncompiled = root.firstChild as UncompiledAnchorNode;
    t.true(uncompiled.hasAttribute('href'));
    t.is(fixPathSeparators(uncompiled.getRequiredValueAttribute('href')), fixPathSeparators('root/path.html'));
});

test('AnchorModule.compileAnchorNode() resolves AnchorNodeResolve.ROOT', t => {
    const root = new DocumentNode();
    const anchor = new CompiledAnchorNode('path.html', AnchorNodeResolve.ROOT);
    root.appendChild(anchor);

    const htmlContext = new MockHtmlCompilerContext(anchor, new MockSharedHtmlCompilerContext(new MockPipelineContext({
        dom: new DocumentNode(),
        path: fixPathSeparators('root/fragment.html')
    })));
    compileAnchorNode(anchor, htmlContext);

    t.truthy(root.firstChild);
    t.true(UncompiledAnchorNode.isUncompiledAnchorNode(root.firstChild as Node));

    const uncompiled = root.firstChild as UncompiledAnchorNode;
    t.true(uncompiled.hasAttribute('href'));
    t.is(fixPathSeparators(uncompiled.getRequiredValueAttribute('href')), fixPathSeparators('root/path.html'));
});

test('AnchorModule.compileAnchorNode() resolves AnchorNodeResolve.BASE', t => {
    const root = new DocumentNode();
    const anchor = new CompiledAnchorNode('path.html', AnchorNodeResolve.BASE);
    root.appendChild(anchor);

    const htmlContext = new MockHtmlCompilerContext(anchor, new MockSharedHtmlCompilerContext(new MockPipelineContext({
        dom: new DocumentNode(),
        path: fixPathSeparators('root/fragment.html')
    })));
    compileAnchorNode(anchor, htmlContext);

    t.truthy(root.firstChild);
    t.true(UncompiledAnchorNode.isUncompiledAnchorNode(root.firstChild as Node));

    const uncompiled = root.firstChild as UncompiledAnchorNode;
    t.true(uncompiled.hasAttribute('href'));
    t.is(fixPathSeparators(uncompiled.getRequiredValueAttribute('href')), fixPathSeparators('../path.html'));
});

// resolveAnchorHref()

test('AnchorModule.resolveAnchorHref() resolves AnchorNodeResolve.NONE', t => {
    const resolved = resolveAnchorHref('path/to/link.html', AnchorNodeResolve.NONE, {
        slotContents: new Map(),
        scope: {},
        fragmentResPath: 'a/child/fragment.html',
        rootResPath: 'a/child/fragment.html'
    });

    t.is(fixPathSeparators(resolved), fixPathSeparators('path/to/link.html'));
});

test('AnchorModule.resolveAnchorHref() resolves AnchorNodeResolve.LOCAL', t => {
    const resolved = resolveAnchorHref(fixPathSeparators('path/to/link.html'), AnchorNodeResolve.LOCAL, {
        slotContents: new Map(),
        scope: {},
        fragmentResPath: fixPathSeparators('a/child/fragment.html'),
        rootResPath: fixPathSeparators('a/child/fragment.html')
    });

    t.is(fixPathSeparators(resolved), fixPathSeparators('a/child/path/to/link.html'));
});

test('AnchorModule.resolveAnchorHref() resolves AnchorNodeResolve.ROOT', t => {
    const resolved = resolveAnchorHref(fixPathSeparators('path/to/link.html'), AnchorNodeResolve.ROOT, {
        slotContents: new Map(),
        scope: {},
        fragmentResPath: fixPathSeparators('a/child/fragment.html'),
        rootResPath: fixPathSeparators('root/fragment.html')
    });

    t.is(fixPathSeparators(resolved), fixPathSeparators('root/path/to/link.html'));
});

test('AnchorModule.resolveAnchorHref() resolves AnchorNodeResolve.BASE', t => {
    const resolved = resolveAnchorHref(fixPathSeparators('path/to/link.html'), AnchorNodeResolve.BASE, {
        slotContents: new Map(),
        scope: {},
        fragmentResPath: fixPathSeparators('a/child/fragment.html'),
        rootResPath: fixPathSeparators('root/fragment.html')
    });

    t.is(fixPathSeparators(resolved), fixPathSeparators('../path/to/link.html'));
});

test('AnchorModule.resolveAnchorHref() throws on invalid AnchorNodeResolve', t => {
    t.throws(() => resolveAnchorHref(fixPathSeparators('path/to/link.html'), 'invalid' as AnchorNodeResolve, {
        slotContents: new Map(),
        scope: {},
        fragmentResPath: fixPathSeparators('a/child/fragment.html'),
        rootResPath: fixPathSeparators('a/child/fragment.html')
    }));
});

// resolveAnchorHrefRoot()

test('AnchorModule.resolveAnchorHrefRoot() resolves relative to root', t => {
    const resolved = resolveAnchorHrefRoot(fixPathSeparators('path/to/link.html'), {
        slotContents: new Map(),
        scope: {},
        fragmentResPath: fixPathSeparators('a/child/fragment.html'),
        rootResPath: fixPathSeparators('root/fragment.html')
    });

    t.is(fixPathSeparators(resolved), fixPathSeparators('root/path/to/link.html'));
});

test('AnchorModule.resolveAnchorHrefRoot() resolves relative to deep root', t => {
    const resolved = resolveAnchorHrefRoot(fixPathSeparators('path/to/link.html'), {
        slotContents: new Map(),
        scope: {},
        fragmentResPath: fixPathSeparators('a/child/fragment.html'),
        rootResPath: fixPathSeparators('root/fragment.html')
    });

    t.is(fixPathSeparators(resolved), fixPathSeparators('root/path/to/link.html'));
});

test('AnchorModule.resolveAnchorHrefRoot() works when current fragment is root', t => {
    const resolved = resolveAnchorHrefRoot(fixPathSeparators('path/to/link.html'), {
        slotContents: new Map(),
        scope: {},
        fragmentResPath: fixPathSeparators('the/root/fragment.html'),
        rootResPath: fixPathSeparators('the/root/fragment.html')
    });

    t.is(fixPathSeparators(resolved), fixPathSeparators('the/root/path/to/link.html'));
});

// resolveAnchorHrefLocal()

test('AnchorModule.resolveAnchorHrefLocal() resolves relative to local', t => {
    const resolved = resolveAnchorHrefLocal(fixPathSeparators('path/to/link.html'), {
        slotContents: new Map(),
        scope: {},
        fragmentResPath: fixPathSeparators('the/root/fragment.html'),
        rootResPath: fixPathSeparators('the/root/fragment.html')
    });

    t.is(fixPathSeparators(resolved), fixPathSeparators('the/root/path/to/link.html'));
});

test('AnchorModule.resolveAnchorHrefLocal() ignores roots and resolves to local', t => {
    const resolved = resolveAnchorHrefLocal(fixPathSeparators('path/to/link.html'), {
        slotContents: new Map(),
        scope: {},
        fragmentResPath: fixPathSeparators('a/child/fragment.html'),
        rootResPath: fixPathSeparators('the/root/fragment.html')
    });

    t.is(fixPathSeparators(resolved), fixPathSeparators('a/child/path/to/link.html'));
});

// resolveAnchorHrefBase()

test('AnchorModule.resolveAnchorHrefBase() resolves relative to base path', t => {
    const resolved = resolveAnchorHrefBase(fixPathSeparators('path/to/link.html'), {
        slotContents: new Map(),
        scope: {},
        fragmentResPath: fixPathSeparators('the/root/fragment.html'),
        rootResPath: fixPathSeparators('the/root/fragment.html')
    });

    t.is(fixPathSeparators(resolved), fixPathSeparators('../../path/to/link.html'));
});

test('AnchorModule.resolveAnchorHrefBase() resolves relative to base path and root fragment', t => {
    const resolved = resolveAnchorHrefBase(fixPathSeparators('path/to/link.html'), {
        slotContents: new Map(),
        scope: {},
        fragmentResPath: fixPathSeparators('a/child/fragment.html'),
        rootResPath: fixPathSeparators('the/root/path/fragment.html')
    });

    t.is(fixPathSeparators(resolved), fixPathSeparators('../../../path/to/link.html'));
});

test('AnchorModule.resolveAnchorHrefBase() resolves correctly when the root fragment is in the base directory', t => {
    const resolved = resolveAnchorHrefBase(fixPathSeparators('path/to/link.html'), {
        slotContents: new Map(),
        scope: {},
        fragmentResPath: fixPathSeparators('index.html'),
        rootResPath: fixPathSeparators('index.html')
    });

    t.is(fixPathSeparators(resolved), fixPathSeparators('path/to/link.html'));
});

test('AnchorModule.resolveAnchorHrefBase() resolves correctly when path starts with ./', t => {
    const resolved = resolveAnchorHrefBase(fixPathSeparators('path/to/link.html'), {
        slotContents: new Map(),
        scope: {},
        fragmentResPath: fixPathSeparators('./index.html'),
        rootResPath: fixPathSeparators('./index.html')
    });

    t.is(fixPathSeparators(resolved), fixPathSeparators('path/to/link.html'));
});
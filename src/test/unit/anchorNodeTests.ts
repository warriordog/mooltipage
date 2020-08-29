import test
    from 'ava';
import {
    AnchorNodeResolve,
    CompiledAnchorNode,
    TagNode,
    TextNode
} from '../../lib';

test('CompileAnchorNode.toUncompiled() copies attributes', t => {
    const uncompiled = new CompiledAnchorNode('path.html', AnchorNodeResolve.LOCAL, new Map([
        ['rel', 'noopener']
    ])).toUncompiled();

    t.is(uncompiled.getAttribute('href'), 'path.html');
    t.is(uncompiled.getAttribute('rel'), 'noopener');
});

test('CompileAnchorNode.toUncompiled() excludes mooltipage attributes', t => {
    const uncompiled = new CompiledAnchorNode('path.html', AnchorNodeResolve.LOCAL, new Map([
        ['rel', 'noopener']
    ])).toUncompiled();

    t.false(uncompiled.hasAttribute('resolve'));
    t.false(uncompiled.hasAttribute('compiled'));
});

test('CompileAnchorNode.toUncompiled() copies child nodes', t => {
    const compiled = new CompiledAnchorNode('path.html', AnchorNodeResolve.LOCAL);
    const linkText = new TextNode('link text');
    compiled.appendChild(linkText);
    const linkDiv = new TagNode('div');
    compiled.appendChild(linkDiv);
    const uncompiled = compiled.toUncompiled();

    t.deepEqual(compiled.childNodes, []);
    t.deepEqual(uncompiled.childNodes, [ linkText, linkDiv ]);
});

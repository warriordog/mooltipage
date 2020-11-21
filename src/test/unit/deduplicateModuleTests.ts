import test from 'ava';
import {
    DeduplicateModule,
    NODE_TAG_IS_DEDUPLICATED
} from '../../lib/pipeline/module/compiler/deduplicateModule';
import {HtmlCompilerContext} from '../../lib/pipeline/module/htmlCompiler';
import {
    Node,
    UncompiledStyleNode,
    TagNode,
    TextNode
} from '../../lib';
import {compareFragmentMacro} from '../_util/htmlCompare';
import {StandardPipelineContext} from '../../lib/pipeline/standardPipeline';

function createHtmlContext(node: Node): HtmlCompilerContext {
    return new HtmlCompilerContext({
        pipelineContext: {} as unknown as StandardPipelineContext,
        uniqueStyles: new Set<string>(),
        uniqueLinks: new Set<string>()
    }, node);
}

// dedupeLink()

test('DeduplicateModule.dedupeLink() skips non-duplicate links', t => {
    const linkNode = new TagNode('link');
    linkNode.setAttribute('href', 'style.css');
    const htmlContext = createHtmlContext(linkNode);

    DeduplicateModule.dedupeLink(linkNode, htmlContext);

    t.false(htmlContext.isDeleted);
});

test('DeduplicateModule.dedupeLink() skips invalid links', t => {
    const linkNode = new TagNode('link');
    const htmlContext = createHtmlContext(linkNode);

    DeduplicateModule.dedupeLink(linkNode, htmlContext);

    t.false(htmlContext.isDeleted);
    t.is(htmlContext.sharedContext.uniqueLinks.size, 0);
});

test('DeduplicateModule.dedupeLink() remembers unique links', t => {
    const linkNode = new TagNode('link');
    linkNode.setAttribute('href', 'style.css');
    const htmlContext = createHtmlContext(linkNode);

    DeduplicateModule.dedupeLink(linkNode, htmlContext);

    t.false(htmlContext.isDeleted);
    t.is(htmlContext.sharedContext.uniqueLinks.size, 1);
    t.true(htmlContext.sharedContext.uniqueLinks.has('style.css'));
});

test('DeduplicateModule.dedupeLink() removes duplicate links', t => {
    const linkNode = new TagNode('link');
    linkNode.setAttribute('href', 'style.css');
    const htmlContext = createHtmlContext(linkNode);
    htmlContext.sharedContext.uniqueLinks.add('style.css');

    DeduplicateModule.dedupeLink(linkNode, htmlContext);

    t.true(htmlContext.isDeleted);
    t.is(htmlContext.sharedContext.uniqueLinks.size, 1);
    t.true(htmlContext.sharedContext.uniqueLinks.has('style.css'));
});

// dedupeStyle

test('DeduplicateModule.dedupeStyle() skips non-duplicate styles', t => {
    const css = '.class {}';
    const styleNode = new UncompiledStyleNode();
    const textNode = new TextNode(css);
    styleNode.appendChild(textNode);
    const htmlContext = createHtmlContext(styleNode);

    DeduplicateModule.dedupeStyle(styleNode, htmlContext);

    t.false(htmlContext.isDeleted);
});

test('DeduplicateModule.dedupeStyle() deletes empty styles', t => {
    const styleNode = new UncompiledStyleNode();
    const htmlContext = createHtmlContext(styleNode);

    DeduplicateModule.dedupeStyle(styleNode, htmlContext);

    t.true(htmlContext.isDeleted);
    t.is(htmlContext.sharedContext.uniqueStyles.size, 0);
});

test('DeduplicateModule.dedupeStyle() remembers unique styles', t => {
    const css = '.class {}';
    const styleNode = new UncompiledStyleNode();
    const textNode = new TextNode(css);
    styleNode.appendChild(textNode);
    const htmlContext = createHtmlContext(styleNode);

    DeduplicateModule.dedupeStyle(styleNode, htmlContext);

    t.false(htmlContext.isDeleted);
    t.is(htmlContext.sharedContext.uniqueStyles.size, 1);
    t.true(htmlContext.sharedContext.uniqueStyles.has(css));
});

test('DeduplicateModule.dedupeStyle() removes duplicate styles', t => {
    const css = '.class {}';
    const styleNode = new UncompiledStyleNode();
    const textNode = new TextNode(css);
    styleNode.appendChild(textNode);
    const htmlContext = createHtmlContext(styleNode);
    htmlContext.sharedContext.uniqueStyles.add(css);

    DeduplicateModule.dedupeStyle(styleNode, htmlContext);

    t.true(htmlContext.isDeleted);
    t.is(htmlContext.sharedContext.uniqueStyles.size, 1);
    t.true(htmlContext.sharedContext.uniqueStyles.has(css));
});

test('DeduplicateModule.dedupeStyle() ignores whitespace', t => {
    const css = '.class {}';
    const cssSpace = `    ${ css }\n\n\n`;
    const styleNode = new UncompiledStyleNode();
    const textNode = new TextNode(cssSpace);
    styleNode.appendChild(textNode);
    const htmlContext = createHtmlContext(styleNode);
    htmlContext.sharedContext.uniqueStyles.add(css);

    DeduplicateModule.dedupeStyle(styleNode, htmlContext);

    t.true(htmlContext.isDeleted);
    t.is(htmlContext.sharedContext.uniqueStyles.size, 1);
    t.true(htmlContext.sharedContext.uniqueStyles.has(css));
});

test('DeduplicateModule.enterNode() skips nodes with tag set', t => {
    const css = '.class{}';
    const styleNode = new UncompiledStyleNode();
    styleNode.nodeTags.add(NODE_TAG_IS_DEDUPLICATED);
    const textNode = new TextNode(css);
    styleNode.appendChild(textNode);
    const htmlContext = createHtmlContext(styleNode);
    htmlContext.sharedContext.uniqueStyles.add(css);

    const dedupeModule = new DeduplicateModule();
    dedupeModule.enterNode(htmlContext);

    t.false(htmlContext.isDeleted);
    t.is(htmlContext.sharedContext.uniqueStyles.size, 1);
    t.true(htmlContext.sharedContext.uniqueStyles.has(css));
});

test('DeduplicateModule works if style is nested multiple slots deep', compareFragmentMacro, `
    <m-fragment src="nested.html">
        <m-fragment src="nested.html">
            <m-fragment src="nested.html">
                <style>.class1{}</style>
                <style>.class2{}</style>
            </m-fragment>
            <style>.class2{}</style>
        </m-fragment>
        <style>.class2{}</style>
    </m-fragment>`,
    `<style>.class1{}</style><style>.class2{}</style>`,
    [
        ['nested.html', `<m-slot></m-slot>`]
    ]);
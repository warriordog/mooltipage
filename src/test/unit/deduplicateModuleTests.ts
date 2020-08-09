import test from 'ava';
import {DeduplicateModule} from '../../lib/pipeline/module/compiler/deduplicateModule';
import {HtmlCompilerContext} from '../../lib/pipeline/module/htmlCompiler';
import {Node, StyleNode, TagNode, TextNode} from '../../lib';
import {PipelineContext} from '../../lib/pipeline/standardPipeline';

function createHtmlContext(node: Node): HtmlCompilerContext {
    return new HtmlCompilerContext({} as unknown as PipelineContext, node);
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
    t.is(htmlContext.uniqueLinks.size, 0);
});

test('DeduplicateModule.dedupeLink() remembers unique links', t => {
    const linkNode = new TagNode('link');
    linkNode.setAttribute('href', 'style.css');
    const htmlContext = createHtmlContext(linkNode);

    DeduplicateModule.dedupeLink(linkNode, htmlContext);

    t.false(htmlContext.isDeleted);
    t.is(htmlContext.uniqueLinks.size, 1);
    t.true(htmlContext.uniqueLinks.has('style.css'));
});

test('DeduplicateModule.dedupeLink() removes duplicate links', t => {
    const linkNode = new TagNode('link');
    linkNode.setAttribute('href', 'style.css');
    const htmlContext = createHtmlContext(linkNode);
    htmlContext.uniqueLinks.add('style.css');

    DeduplicateModule.dedupeLink(linkNode, htmlContext);

    t.true(htmlContext.isDeleted);
    t.is(htmlContext.uniqueLinks.size, 1);
    t.true(htmlContext.uniqueLinks.has('style.css'));
});

// dedupeStyle

test('DeduplicateModule.dedupeStyle() skips non-duplicate styles', t => {
    const css = '.class {}';
    const styleNode = new StyleNode();
    const textNode = new TextNode(css);
    styleNode.appendChild(textNode);
    const htmlContext = createHtmlContext(styleNode);

    DeduplicateModule.dedupeStyle(styleNode, htmlContext);

    t.false(htmlContext.isDeleted);
});

test('DeduplicateModule.dedupeStyle() deletes empty styles', t => {
    const styleNode = new StyleNode();
    const htmlContext = createHtmlContext(styleNode);

    DeduplicateModule.dedupeStyle(styleNode, htmlContext);

    t.true(htmlContext.isDeleted);
    t.is(htmlContext.uniqueStyles.size, 0);
});

test('DeduplicateModule.dedupeStyle() remembers unique styles', t => {
    const css = '.class {}';
    const styleNode = new StyleNode();
    const textNode = new TextNode(css);
    styleNode.appendChild(textNode);
    const htmlContext = createHtmlContext(styleNode);

    DeduplicateModule.dedupeStyle(styleNode, htmlContext);

    t.false(htmlContext.isDeleted);
    t.is(htmlContext.uniqueStyles.size, 1);
    t.true(htmlContext.uniqueStyles.has(css));
});

test('DeduplicateModule.dedupeStyle() removes duplicate styles', t => {
    const css = '.class {}';
    const styleNode = new StyleNode();
    const textNode = new TextNode(css);
    styleNode.appendChild(textNode);
    const htmlContext = createHtmlContext(styleNode);
    htmlContext.uniqueStyles.add(css);

    DeduplicateModule.dedupeStyle(styleNode, htmlContext);

    t.true(htmlContext.isDeleted);
    t.is(htmlContext.uniqueStyles.size, 1);
    t.true(htmlContext.uniqueStyles.has(css));
});

test('DeduplicateModule.dedupeStyle() ignores whitespace', t => {
    const css = '.class {}';
    const cssSpace = `    ${ css }\n\n\n`;
    const styleNode = new StyleNode();
    const textNode = new TextNode(cssSpace);
    styleNode.appendChild(textNode);
    const htmlContext = createHtmlContext(styleNode);
    htmlContext.uniqueStyles.add(css);

    DeduplicateModule.dedupeStyle(styleNode, htmlContext);

    t.true(htmlContext.isDeleted);
    t.is(htmlContext.uniqueStyles.size, 1);
    t.true(htmlContext.uniqueStyles.has(css));
});

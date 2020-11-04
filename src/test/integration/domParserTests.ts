import test, { ExecutionContext } from 'ava';
import { DomParser } from '../../lib/dom/domParser';
import {
    CDATANode,
    CommentNode,
    MImportNode,
    Node,
    TagNode,
    TextNode
} from '../../lib';

function testTags(t: ExecutionContext, html: string, tags: string[]): void {
    const domParser = new DomParser();

    const dom = domParser.parseDom(html);

    let nextNode: Node | null | undefined = dom.firstChild;
    for (const expectedTag of tags) {
        t.truthy(nextNode);
        t.true(TagNode.isTagNode(nextNode as Node));
        t.is((nextNode as TagNode).tagName, expectedTag);
        t.is((nextNode as TagNode).childNodes.length, 0);
        
        nextNode = nextNode?.nextSibling;
    }
}

test('DomParser handles void tags', testTags, '<div></div><br><meta><input><div></div>', ['div', 'br', 'meta', 'input', 'div']);
test('DomParser handles void tags with explicit closing', testTags, '<div></div><br/><meta/><input/><div></div>', ['div', 'br', 'meta', 'input', 'div']);
test('DomParser handles void tags with explicit closing and space', testTags, '<div></div><br /><meta /><input /><div></div>', ['div', 'br', 'meta', 'input', 'div']);
test('DomParser handles custom tags used as void', testTags, '<div></div><m-slot /><m-content /><m-var /><div></div>', ['div', 'm-slot', 'm-content', 'm-var', 'div']);
test('DomParser handles standard tags used as void', testTags, '<div></div><div /><p /><h1 /><div></div>', ['div', 'div', 'p', 'h1', 'div']);
test('DomParser handles special tags used as void', testTags, '<div></div><script /><style /><title /><div></div>', ['div', 'script', 'style', 'title', 'div']);

test('DomParser parses CDATA as CDATANode when CDATA enabled', t => {
    const domParser = new DomParser({
        recognizeCDATA: true
    });
    const dom = domParser.parseDom('<![CDATA[cdata contents]]>');
    t.truthy(dom.firstChild);
    t.true(CDATANode.isCDATANode(dom.firstChild as Node));
    t.truthy((dom.firstChild as CDATANode).firstChild);
    t.true(TextNode.isTextNode((dom.firstChild as CDATANode).firstChild as Node));
    t.is(((dom.firstChild as CDATANode).firstChild as TextNode).text, 'cdata contents');
});
test('DomParser parses CDATA as CommentNode when CDATA disabled', t => {
    const domParser = new DomParser({
        recognizeCDATA: false
    });
    const dom = domParser.parseDom('<![CDATA[cdata contents]]>');
    t.truthy(dom.firstChild);
    t.true(CommentNode.isCommentNode(dom.firstChild as Node));
    t.is((dom.firstChild as CommentNode).text, '[CDATA[cdata contents]]');
});

test('DomParser handles MImportNode without "as" parameter', t => {
    const dom = new DomParser().parseDom(`
        <m-import id="1" src="frag.html" />
        <m-import id="2" src="fragWithCamelCase.html" />
        <m-import id="3" src="path/frag.html" />
        <m-import id="4" src="long/path/fragWithCamelCase.html" />
        <m-import id="5" src="fragWith.multiple.extensions.html" />
    `);
    const mi1 = dom.findChildNode(node => TagNode.isTagNode(node) && MImportNode.isMImportNode(node) && node.getAttribute('id') === '1') as MImportNode;
    const mi2 = dom.findChildNode(node => TagNode.isTagNode(node) && MImportNode.isMImportNode(node) && node.getAttribute('id') === '2') as MImportNode;
    const mi3 = dom.findChildNode(node => TagNode.isTagNode(node) && MImportNode.isMImportNode(node) && node.getAttribute('id') === '3') as MImportNode;
    const mi4 = dom.findChildNode(node => TagNode.isTagNode(node) && MImportNode.isMImportNode(node) && node.getAttribute('id') === '4') as MImportNode;
    const mi5 = dom.findChildNode(node => TagNode.isTagNode(node) && MImportNode.isMImportNode(node) && node.getAttribute('id') === '5') as MImportNode;
    t.is(mi1.as, 'frag');
    t.is(mi2.as, 'frag-with-camel-case');
    t.is(mi3.as, 'frag');
    t.is(mi4.as, 'frag-with-camel-case');
    t.is(mi5.as, 'frag-with');
});
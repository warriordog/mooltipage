import test, { ExecutionContext } from 'ava';
import { DomParser } from '../../lib/dom/domParser';
import {
    CDATANode,
    CommentNode,
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

// This is a bug in htmlparser2. It has been fixed upstream, but the latest release does not yet have the patch.
test.failing('DomParser handles special tags used as void', testTags, '<div></div><script /><style /><title /><div></div>', ['div', 'script', 'style', 'title', 'div']);

test('DomParser allows non-text in <title>', t => {
    const domParser = new DomParser();
    const dom = domParser.parseDom('<title><div></div></title>');
    
    const title = dom.firstChild;
    t.truthy(title);
    t.true(TagNode.isTagNode(title as Node));
    t.is((title as TagNode).tagName, 'title');

    const div = (title as TagNode).firstChild;
    t.truthy(div);
    t.true(TagNode.isTagNode(div as Node));
    t.is((div as TagNode).tagName, 'div');
});

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
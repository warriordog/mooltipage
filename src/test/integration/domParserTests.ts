import test, { ExecutionContext } from 'ava';
import { DomParser } from '../../lib/dom/domParser';
import { Node, TagNode } from '../../lib';

function testTags(t: ExecutionContext, html: string, tags: string[]) {
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

test('[integration] DomParser handles void tags', testTags, '<div></div><br><meta><input><div></div>', ['div', 'br', 'meta', 'input', 'div']);
test('[integration] DomParser handles void tags with explicit closing', testTags, '<div></div><br/><meta/><input/><div></div>', ['div', 'br', 'meta', 'input', 'div']);
test('[integration] DomParser handles void tags with explicit closing and space', testTags, '<div></div><br /><meta /><input /><div></div>', ['div', 'br', 'meta', 'input', 'div']);
test('[integration] DomParser handles custom tags used as void', testTags, '<div></div><m-slot /><m-content /><m-var /><div></div>', ['div', 'm-slot', 'm-content', 'm-var', 'div']);
test('[integration] DomParser handles standard tags used as void', testTags, '<div></div><div /><p /><h1 /><div></div>', ['div', 'div', 'p', 'h1', 'div']);

// This is a bug in htmlparser2. A PR has been submitted to fix the issue.
test.failing('[integration] DomParser handles special tags used as void', testTags, '<div></div><script /><style /><title /><div></div>', ['div', 'script', 'style', 'title', 'div']);

test('[integration] DomParser allows non-text in <title>', t => {
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
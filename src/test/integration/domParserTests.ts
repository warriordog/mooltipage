import test from 'ava';
import { DomParser, ProcessingInstructionNode, TagNode, TextNode, CommentNode, CDATANode } from '../../lib/index';

test('[integration] DomParser can parse standard HTML', t => {
    const domParser = new DomParser();

    domParser.onprocessinginstruction('!DOCTYPE html', '');
    domParser.onopentag('div', { 'id': 'root' })
    domParser.onopentag('p', {});
    domParser.ontext('Hello, world!');
    domParser.onclosetag();
    domParser.oncomment('This is an HTML comment');
    domParser.oncdatastart();
    domParser.ontext('This is CDATA content');
    domParser.oncdataend();
    domParser.onclosetag();

    const dom = domParser.dom;
    t.truthy(dom);

    const pi = dom.firstChild as ProcessingInstructionNode;
    t.truthy(pi);
    t.true(ProcessingInstructionNode.isProcessingInstructionNode(pi));
    t.is(pi.name, '!DOCTYPE html');

    const div = pi.nextSibling as TagNode;
    t.truthy(div);
    t.true(TagNode.isTagNode(div));
    t.is(div.tagName, 'div');
    
    const p = div.firstChild as TagNode;
    t.truthy(p);
    t.true(TagNode.isTagNode(p));
    t.is(p.tagName, 'p');

    const pText = p.firstChild as TextNode;
    t.truthy(pText);
    t.true(TextNode.isTextNode(pText));
    t.is(pText.text,'Hello, world!');
    
    const comment = p.nextSibling as CommentNode;
    t.truthy(comment);
    t.true(CommentNode.isCommentNode(comment));
    t.is(comment.text, 'This is an HTML comment');
    
    const cdata = comment.nextSibling as CDATANode;
    t.truthy(cdata);
    t.true(CDATANode.isCDATANode(cdata));

    const cdataText = cdata.firstChild as TextNode;
    t.truthy(cdataText);
    t.true(TextNode.isTextNode(cdataText));
    t.is(cdataText.text, 'This is CDATA content');
});

test('[integration] DomParser can reset state', t => {
    const domParser = new DomParser();

    domParser.onopentag('div', { 'id': 'wrong' })
    domParser.ontext('oops!');

    domParser.onreset();

    domParser.onopentag('div', { 'id': 'right' })
    domParser.ontext('good!');
    domParser.onclosetag();

    const dom = domParser.dom;
    t.truthy(dom);

    const div = dom.firstChild as TagNode;
    t.truthy(div);
    t.true(TagNode.isTagNode(div));
    t.is(div.getAttribute('id'), 'right');
    t.falsy(div.nextSibling);

    const text = div.firstChild as TextNode;
    t.truthy(text);
    t.true(TextNode.isTextNode(text));
    t.is(text.text, 'good!');
});

test('[integration] DomParser throws on error', t => {
    const domParser = new DomParser();

    domParser.onopentag('div', {})

    t.throws(() => domParser.onerror(new Error()));
});
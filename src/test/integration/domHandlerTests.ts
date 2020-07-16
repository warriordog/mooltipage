import test from 'ava';
import { DomHandler, ProcessingInstructionNode, TagNode, TextNode, CommentNode, CDATANode } from '../../lib/index';

test('[integration] DomHandler can parse standard HTML', t => {
    const domHandler = new DomHandler();

    domHandler.onprocessinginstruction('!DOCTYPE html', '');
    domHandler.onopentag('div', { 'id': 'root' })
    domHandler.onopentag('p', {});
    domHandler.ontext('Hello, world!');
    domHandler.onclosetag();
    domHandler.oncomment('This is an HTML comment');
    domHandler.oncdatastart();
    domHandler.ontext('This is CDATA content');
    domHandler.oncdataend();
    domHandler.onclosetag();

    const dom = domHandler.getDom();
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

test('[integration] DomHandler can reset state', t => {
    const domHandler = new DomHandler();

    domHandler.onopentag('div', { 'id': 'wrong' })
    domHandler.ontext('oops!');

    domHandler.onreset();

    domHandler.onopentag('div', { 'id': 'right' })
    domHandler.ontext('good!');
    domHandler.onclosetag();

    const dom = domHandler.getDom();
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

test('[integration] DomHandler throws on error', t => {
    const domHandler = new DomHandler();

    domHandler.onopentag('div', {})

    t.throws(() => domHandler.onerror(new Error()));
});
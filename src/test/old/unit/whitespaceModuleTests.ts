import test
    from 'ava';
import {DomParser} from '../../../lib/dom/domParser';
import {
    NodeType,
    TextNode
} from '../../../lib';
import {WhitespaceModule} from '../../../lib/pipeline/module/compiler/whitespaceModule';
import {MockHtmlCompilerContext} from '../../_mocks/mockHtmlCompilerContext';

test('WhitespaceModule sets whitespace on all child text nodes', t => {
    const dom = new DomParser().parseDom(`
        <m-whitespace>
            First text
            <span>Second text</span>
            Third text
        </m-whitespace>`);
    const mWhitespace = dom.findChildTagByTagName('m-whitespace');
    if (mWhitespace === null) throw new Error('Test error: input DOM does not have an m-whitespace node');

    const mWhitespaceChildText = mWhitespace.findChildNodesByNodeType(NodeType.Text);

    new WhitespaceModule().exitNode(new MockHtmlCompilerContext(mWhitespace));

    for (const textNode of mWhitespaceChildText) {
        t.true(textNode.isWhitespaceSensitive);
    }
});

test('WhitespaceModule handles m-whitespace with no children', t => {
    const dom = new DomParser().parseDom(`<m-whitespace></m-whitespace>`);
    const mWhitespace = dom.findChildTagByTagName('m-whitespace');
    if (mWhitespace === null) throw new Error('Test error: input DOM does not have an m-whitespace node');

    new WhitespaceModule().exitNode(new MockHtmlCompilerContext(mWhitespace));

    // if it doesn't crash, then test passes
    t.pass();
});

test('WhitespaceModule removes m-whitespace and promotes children', t => {
    const dom = new DomParser().parseDom(`
        <m-whitespace>
            First text
            <span>Second text</span>
            Third text
        </m-whitespace>`);
    const mWhitespace = dom.findChildTagByTagName('m-whitespace');
    if (mWhitespace === null) throw new Error('Test error: input DOM does not have an m-whitespace node');

    new WhitespaceModule().exitNode(new MockHtmlCompilerContext(mWhitespace));

    // removes from DOM
    t.is(mWhitespace.parentNode, null);

    // children are promoted
    t.is(mWhitespace.firstChild, null);
    t.truthy(dom.findChildNode(node => TextNode.isTextNode(node) && node.text.includes('First')));
});

test('WhitespaceModule can set insensitive', t => {
    const dom = new DomParser().parseDom(`
        <m-whitespace mode="insensitive">
            First text
            <span>Second text</span>
            Third text
        </m-whitespace>`);
    const mWhitespace = dom.findChildTagByTagName('m-whitespace');
    if (mWhitespace === null) throw new Error('Test error: input DOM does not have an m-whitespace node');

    const mWhitespaceChildText = mWhitespace.findChildNodesByNodeType(NodeType.Text);

    new WhitespaceModule().exitNode(new MockHtmlCompilerContext(mWhitespace));

    for (const textNode of mWhitespaceChildText) {
        t.false(textNode.isWhitespaceSensitive);
    }
});

test('WhitespaceModule works when nested', t => {
    const dom = new DomParser().parseDom(`
        <m-whitespace>
            First text
            <m-whitespace mode="insensitive">
                Second text
            </m-whitespace>
            Third text
        </m-whitespace>`);
    const mWhitespace = dom.findChildTagByTagName('m-whitespace');
    if (mWhitespace === null) throw new Error('Test error: input DOM does not have an m-whitespace node');
    const childMWhitespace = mWhitespace.findChildTagByTagName('m-whitespace');
    if (childMWhitespace === null) throw new Error('Test error: nested m-whitespace is missing');

    const module = new WhitespaceModule();
    module.exitNode(new MockHtmlCompilerContext(childMWhitespace));
    module.exitNode(new MockHtmlCompilerContext(mWhitespace));

    const firstText = dom.findChildNode(node => TextNode.isTextNode(node) && node.text.includes('First')) as TextNode | null;
    const secondText = dom.findChildNode(node => TextNode.isTextNode(node) && node.text.includes('Second')) as TextNode | null;
    const thirdText = dom.findChildNode(node => TextNode.isTextNode(node) && node.text.includes('Third')) as TextNode | null;

    t.true(firstText?.isWhitespaceSensitive);
    t.false(secondText?.isWhitespaceSensitive);
    t.true(thirdText?.isWhitespaceSensitive);
});
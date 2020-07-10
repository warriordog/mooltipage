import { TestSet, TestCallback } from "../framework/testSet";
import * as Assert from '../framework/assert';
import { TagNode, TextNode, CommentNode, ProcessingInstructionNode } from '../../lib/dom/node';

export class NodeConstructorTests implements TestSet {

    // test methods
    private TestTagNode(): void {
        const attributes: Map<string, string> = new Map<string, string>();
        attributes.set('foo', 'bar');

        const node: TagNode = new TagNode('sometag', attributes);

        Assert.AreEqual('sometag', node.tagName);
        Assert.AreEqual('bar', node.getAttribute('foo'));
    }
    private TestTagNodeDefaults(): void {
        const node: TagNode = new TagNode('sometag');

        Assert.AreEqual('sometag', node.tagName);
        Assert.IsNotNullish(node.getAttributes());
        Assert.IsEmpty(node.getAttributes());
    }
    
    private TestTextNode(): void {
        const node: TextNode = new TextNode('some text');

        Assert.AreEqual('some text', node.text);
    }
    private TestTextNodeDefaults(): void {
        const node: TextNode = new TextNode();

        Assert.AreEqual('', node.text);
    }
    
    private TestCommentNode(): void {
        const node: CommentNode = new CommentNode('some text');

        Assert.AreEqual('some text', node.text);
    }
    private TestCommentNodeDefaults(): void {
        const node: CommentNode = new CommentNode();

        Assert.AreEqual(node.text, '');
    }
    
    private TestPINode(): void {
        const node: ProcessingInstructionNode = new ProcessingInstructionNode('name', 'data');

        Assert.AreEqual('name', node.name);
        Assert.AreEqual('data', node.data);
    }
    private TestPIDefaults(): void {
        const node: ProcessingInstructionNode = new ProcessingInstructionNode();

        Assert.AreEqual('', node.name);
        Assert.AreEqual('', node.data);
    }

    // test set boilerplate
    readonly setName: string = 'NodeConstructor';
    getTests(): Map<string, TestCallback> {
        return new Map<string, TestCallback>([
            ['TagNode', (): void => this.TestTagNode()],
            ['TagNodeDefaults', (): void => this.TestTagNodeDefaults()],
            ['TextNode', (): void => this.TestTextNode()],
            ['TextNodeDefaults', (): void => this.TestTextNodeDefaults()],
            ['CommentNode', (): void => this.TestCommentNode()],
            ['CommentNodeDefaults', (): void => this.TestCommentNodeDefaults()],
            ['PINode', (): void => this.TestPINode()],
            ['PIDefaults', (): void => this.TestPIDefaults()],
        ]);
    }
}
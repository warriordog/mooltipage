import { TestSet, TestCallback } from "../framework/testSet";
import * as Assert from '../framework/assert';
import { TagNode, TextNode, CommentNode, ProcessingInstructionNode } from '../../lib/dom/node';

export class NodeConstructorTests implements TestSet {

    // test methods
    private TestTagNode(): void {
        const attributes: Map<string, string> = new Map<string, string>();
        attributes.set('foo', 'bar');

        const node: TagNode = new TagNode('sometag', attributes);

        Assert.AreEqual(node.tagName, 'sometag');
        Assert.AreEqual(node.attributes.get('foo'), 'bar');
    }
    private TestTagNodeDefaults(): void {
        const node: TagNode = new TagNode('sometag');

        Assert.AreEqual(node.tagName, 'sometag');
        Assert.IsNotNullish(node.attributes);
        Assert.IsEmpty(node.attributes);
    }
    
    private TestTextNode(): void {
        const node: TextNode = new TextNode('some text');

        Assert.AreEqual(node.text, 'some text');
    }
    private TestTextNodeDefaults(): void {
        const node: TextNode = new TextNode();

        Assert.AreEqual(node.text, '');
    }
    
    private TestCommentNode(): void {
        const node: CommentNode = new CommentNode('some text');

        Assert.AreEqual(node.text, 'some text');
    }
    private TestCommentNodeDefaults(): void {
        const node: CommentNode = new CommentNode();

        Assert.AreEqual(node.text, '');
    }
    
    private TestPINode(): void {
        const node: ProcessingInstructionNode = new ProcessingInstructionNode('name', 'data');

        Assert.AreEqual(node.name, 'name');
        Assert.AreEqual(node.data, 'data');
    }
    private TestPIDefaults(): void {
        const node: ProcessingInstructionNode = new ProcessingInstructionNode();

        Assert.AreEqual(node.name, '');
        Assert.AreEqual(node.data, '');
    }

    // test set boilerplate
    readonly setName: string = 'NodeConstructorTests';
    getTests(): Map<string, TestCallback> {
        return new Map<string, TestCallback>([
            ['TestTagNode', (): void => this.TestTagNode()],
            ['TestTagNodeDefaults', (): void => this.TestTagNodeDefaults()],
            ['TestTextNode', (): void => this.TestTextNode()],
            ['TestTextNodeDefaults', (): void => this.TestTextNodeDefaults()],
            ['TestCommentNode', (): void => this.TestCommentNode()],
            ['TestCommentNodeDefaults', (): void => this.TestCommentNodeDefaults()],
            ['TestPINode', (): void => this.TestPINode()],
            ['TestPIDefaults', (): void => this.TestPIDefaults()],
        ]);
    }
}
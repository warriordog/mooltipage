import { TestSet, TestCallback } from "../framework/testSet";
import * as Assert from '../framework/assert';
import { DocumentNode, TagNode, TextNode, CommentNode, ProcessingInstructionNode, CDATANode, NodeWithChildren, NodeWithText, NodeWithData } from '../../lib/dom/node';

export class NodeIsTypeTests implements TestSet {

    // test methods
    private TestIsTagNode(): void {
        const tagNode: TagNode = new TagNode('sometag');
        const textNode: TextNode = new TextNode();
        const commentNode: CommentNode = new CommentNode();
        const piNode: ProcessingInstructionNode = new ProcessingInstructionNode();
        const domNode: DocumentNode = new DocumentNode();
        const cdataNode: CDATANode = new CDATANode();

        Assert.IsTrue(TagNode.isTagNode(tagNode));
        Assert.IsFalse(TagNode.isTagNode(textNode));
        Assert.IsFalse(TagNode.isTagNode(commentNode));
        Assert.IsFalse(TagNode.isTagNode(piNode));
        Assert.IsFalse(TagNode.isTagNode(domNode));
        Assert.IsFalse(TagNode.isTagNode(cdataNode));
    }
    
    private TestIsTextNode(): void {
        const tagNode: TagNode = new TagNode('sometag');
        const textNode: TextNode = new TextNode();
        const commentNode: CommentNode = new CommentNode();
        const piNode: ProcessingInstructionNode = new ProcessingInstructionNode();
        const domNode: DocumentNode = new DocumentNode();
        const cdataNode: CDATANode = new CDATANode();

        Assert.IsFalse(TextNode.isTextNode(tagNode));
        Assert.IsTrue(TextNode.isTextNode(textNode));
        Assert.IsFalse(TextNode.isTextNode(commentNode));
        Assert.IsFalse(TextNode.isTextNode(piNode));
        Assert.IsFalse(TextNode.isTextNode(domNode));
        Assert.IsFalse(TextNode.isTextNode(cdataNode));
    }
    
    private TestIsCommentNode(): void {
        const tagNode: TagNode = new TagNode('sometag');
        const textNode: TextNode = new TextNode();
        const commentNode: CommentNode = new CommentNode();
        const piNode: ProcessingInstructionNode = new ProcessingInstructionNode();
        const domNode: DocumentNode = new DocumentNode();
        const cdataNode: CDATANode = new CDATANode();

        Assert.IsFalse(CommentNode.isCommentNode(tagNode));
        Assert.IsFalse(CommentNode.isCommentNode(textNode));
        Assert.IsTrue(CommentNode.isCommentNode(commentNode));
        Assert.IsFalse(CommentNode.isCommentNode(piNode));
        Assert.IsFalse(CommentNode.isCommentNode(domNode));
        Assert.IsFalse(CommentNode.isCommentNode(cdataNode));
    }
    
    private TestIsPINode(): void {
        const tagNode: TagNode = new TagNode('sometag');
        const textNode: TextNode = new TextNode();
        const commentNode: CommentNode = new CommentNode();
        const piNode: ProcessingInstructionNode = new ProcessingInstructionNode();
        const domNode: DocumentNode = new DocumentNode();
        const cdataNode: CDATANode = new CDATANode();

        Assert.IsFalse(ProcessingInstructionNode.isProcessingInstructionNode(tagNode));
        Assert.IsFalse(ProcessingInstructionNode.isProcessingInstructionNode(textNode));
        Assert.IsFalse(ProcessingInstructionNode.isProcessingInstructionNode(commentNode));
        Assert.IsTrue(ProcessingInstructionNode.isProcessingInstructionNode(piNode));
        Assert.IsFalse(ProcessingInstructionNode.isProcessingInstructionNode(domNode));
        Assert.IsFalse(ProcessingInstructionNode.isProcessingInstructionNode(cdataNode));
    }
    
    private TestIsDocumentNode(): void {
        const tagNode: TagNode = new TagNode('sometag');
        const textNode: TextNode = new TextNode();
        const commentNode: CommentNode = new CommentNode();
        const piNode: ProcessingInstructionNode = new ProcessingInstructionNode();
        const domNode: DocumentNode = new DocumentNode();
        const cdataNode: CDATANode = new CDATANode();

        Assert.IsFalse(DocumentNode.isDocumentNode(tagNode));
        Assert.IsFalse(DocumentNode.isDocumentNode(textNode));
        Assert.IsFalse(DocumentNode.isDocumentNode(commentNode));
        Assert.IsFalse(DocumentNode.isDocumentNode(piNode));
        Assert.IsTrue(DocumentNode.isDocumentNode(domNode));
        Assert.IsFalse(DocumentNode.isDocumentNode(cdataNode));
    }

    private TestIsCdataNode(): void {
        const tagNode: TagNode = new TagNode('sometag');
        const textNode: TextNode = new TextNode();
        const commentNode: CommentNode = new CommentNode();
        const piNode: ProcessingInstructionNode = new ProcessingInstructionNode();
        const domNode: DocumentNode = new DocumentNode();
        const cdataNode: CDATANode = new CDATANode();

        Assert.IsFalse(CDATANode.isCDATANode(tagNode));
        Assert.IsFalse(CDATANode.isCDATANode(textNode));
        Assert.IsFalse(CDATANode.isCDATANode(commentNode));
        Assert.IsFalse(CDATANode.isCDATANode(piNode));
        Assert.IsFalse(CDATANode.isCDATANode(domNode));
        Assert.IsTrue(CDATANode.isCDATANode(cdataNode));
    }

    private TestIsNodeWithChildren(): void {
        const tagNode: TagNode = new TagNode('sometag');
        const textNode: TextNode = new TextNode();
        const commentNode: CommentNode = new CommentNode();
        const piNode: ProcessingInstructionNode = new ProcessingInstructionNode();
        const domNode: DocumentNode = new DocumentNode();
        const cdataNode: CDATANode = new CDATANode();

        Assert.IsTrue(NodeWithChildren.isNodeWithChildren(tagNode));
        Assert.IsFalse(NodeWithChildren.isNodeWithChildren(textNode));
        Assert.IsFalse(NodeWithChildren.isNodeWithChildren(commentNode));
        Assert.IsFalse(NodeWithChildren.isNodeWithChildren(piNode));
        Assert.IsTrue(NodeWithChildren.isNodeWithChildren(domNode));
        Assert.IsTrue(NodeWithChildren.isNodeWithChildren(cdataNode));
    }

    private TestIsNodeWithText(): void {
        const tagNode: TagNode = new TagNode('sometag');
        const textNode: TextNode = new TextNode();
        const commentNode: CommentNode = new CommentNode();
        const piNode: ProcessingInstructionNode = new ProcessingInstructionNode();
        const domNode: DocumentNode = new DocumentNode();
        const cdataNode: CDATANode = new CDATANode();

        Assert.IsFalse(NodeWithText.isNodeWithText(tagNode));
        Assert.IsTrue(NodeWithText.isNodeWithText(textNode));
        Assert.IsTrue(NodeWithText.isNodeWithText(commentNode));
        Assert.IsFalse(NodeWithText.isNodeWithText(piNode));
        Assert.IsFalse(NodeWithText.isNodeWithText(domNode));
        Assert.IsFalse(NodeWithText.isNodeWithText(cdataNode));
    }

    private TestIsNodeWithData(): void {
        const tagNode: TagNode = new TagNode('sometag');
        const textNode: TextNode = new TextNode();
        const commentNode: CommentNode = new CommentNode();
        const piNode: ProcessingInstructionNode = new ProcessingInstructionNode();
        const domNode: DocumentNode = new DocumentNode();
        const cdataNode: CDATANode = new CDATANode();

        Assert.IsFalse(NodeWithData.isNodeWithData(tagNode));
        Assert.IsFalse(NodeWithData.isNodeWithData(textNode));
        Assert.IsFalse(NodeWithData.isNodeWithData(commentNode));
        Assert.IsTrue(NodeWithData.isNodeWithData(piNode));
        Assert.IsFalse(NodeWithData.isNodeWithData(domNode));
        Assert.IsFalse(NodeWithData.isNodeWithData(cdataNode));
    }

    // test set boilerplate
    readonly setName: string = 'NodeIsTypeTests';
    getTests(): Map<string, TestCallback> {
        return new Map<string, TestCallback>([
            ['TestIsTagNode', (): void => this.TestIsTagNode()],
            ['TestIsTextNode', (): void => this.TestIsTextNode()],
            ['TestIsCommentNode', (): void => this.TestIsCommentNode()],
            ['TestIsPINode', (): void => this.TestIsPINode()],
            ['TestIsDocumentNode', (): void => this.TestIsDocumentNode()],
            ['TestIsCdataNode', (): void => this.TestIsCdataNode()],
            ['TestIsNodeWithChildren', (): void => this.TestIsNodeWithChildren()],
            ['TestIsNodeWithText', (): void => this.TestIsNodeWithText()],
            ['TestIsNodeWithData', (): void => this.TestIsNodeWithData()],
        ]);
    }
}
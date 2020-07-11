import { TestSet, TestCallback } from "../framework/testSet";
import * as Assert from '../framework/assert';
import { DocumentNode, TagNode, TextNode, CommentNode, ProcessingInstructionNode, CDATANode, NodeWithChildren, NodeWithText, NodeWithData, MComponentNode, MFragmentNode, MContentNode, MSlotNode, MVarNode } from '../../lib/dom/node';

export class NodeIsTypeTests implements TestSet {

    // test methods
    private TestIsTagNode(): void {
        const tagNode: TagNode = new TagNode('sometag');
        const textNode: TextNode = new TextNode();
        const commentNode: CommentNode = new CommentNode();
        const piNode: ProcessingInstructionNode = new ProcessingInstructionNode();
        const domNode: DocumentNode = new DocumentNode();
        const cdataNode: CDATANode = new CDATANode();
        const mFragmentNode = new MFragmentNode(new Map([['src', 'foo']]));
        const mComponentNode = new MComponentNode(new Map([['src', 'foo']]));
        const mContentNode = new MContentNode();
        const mSlotNode = new MSlotNode();
        const mVarsNode = new MVarNode();

        Assert.IsTrue(TagNode.isTagNode(tagNode));
        Assert.IsFalse(TagNode.isTagNode(textNode));
        Assert.IsFalse(TagNode.isTagNode(commentNode));
        Assert.IsFalse(TagNode.isTagNode(piNode));
        Assert.IsFalse(TagNode.isTagNode(domNode));
        Assert.IsFalse(TagNode.isTagNode(cdataNode));
        Assert.IsTrue(TagNode.isTagNode(mFragmentNode));
        Assert.IsTrue(TagNode.isTagNode(mComponentNode));
        Assert.IsTrue(TagNode.isTagNode(mContentNode));
        Assert.IsTrue(TagNode.isTagNode(mSlotNode));
        Assert.IsTrue(TagNode.isTagNode(mVarsNode));
    }
    
    private TestIsTextNode(): void {
        const tagNode: TagNode = new TagNode('sometag');
        const textNode: TextNode = new TextNode();
        const commentNode: CommentNode = new CommentNode();
        const piNode: ProcessingInstructionNode = new ProcessingInstructionNode();
        const domNode: DocumentNode = new DocumentNode();
        const cdataNode: CDATANode = new CDATANode();
        const mFragmentNode = new MFragmentNode(new Map([['src', 'foo']]));
        const mComponentNode = new MComponentNode(new Map([['src', 'foo']]));
        const mContentNode = new MContentNode();
        const mSlotNode = new MSlotNode();
        const mVarsNode = new MVarNode();

        Assert.IsFalse(TextNode.isTextNode(tagNode));
        Assert.IsTrue(TextNode.isTextNode(textNode));
        Assert.IsFalse(TextNode.isTextNode(commentNode));
        Assert.IsFalse(TextNode.isTextNode(piNode));
        Assert.IsFalse(TextNode.isTextNode(domNode));
        Assert.IsFalse(TextNode.isTextNode(cdataNode));
        Assert.IsFalse(TextNode.isTextNode(mFragmentNode));
        Assert.IsFalse(TextNode.isTextNode(mComponentNode));
        Assert.IsFalse(TextNode.isTextNode(mContentNode));
        Assert.IsFalse(TextNode.isTextNode(mSlotNode));
        Assert.IsFalse(TextNode.isTextNode(mVarsNode));
    }
    
    private TestIsCommentNode(): void {
        const tagNode: TagNode = new TagNode('sometag');
        const textNode: TextNode = new TextNode();
        const commentNode: CommentNode = new CommentNode();
        const piNode: ProcessingInstructionNode = new ProcessingInstructionNode();
        const domNode: DocumentNode = new DocumentNode();
        const cdataNode: CDATANode = new CDATANode();
        const mFragmentNode = new MFragmentNode(new Map([['src', 'foo']]));
        const mComponentNode = new MComponentNode(new Map([['src', 'foo']]));
        const mContentNode = new MContentNode();
        const mSlotNode = new MSlotNode();
        const mVarsNode = new MVarNode();

        Assert.IsFalse(CommentNode.isCommentNode(tagNode));
        Assert.IsFalse(CommentNode.isCommentNode(textNode));
        Assert.IsTrue(CommentNode.isCommentNode(commentNode));
        Assert.IsFalse(CommentNode.isCommentNode(piNode));
        Assert.IsFalse(CommentNode.isCommentNode(domNode));
        Assert.IsFalse(CommentNode.isCommentNode(cdataNode));
        Assert.IsFalse(CommentNode.isCommentNode(mFragmentNode));
        Assert.IsFalse(CommentNode.isCommentNode(mComponentNode));
        Assert.IsFalse(CommentNode.isCommentNode(mContentNode));
        Assert.IsFalse(CommentNode.isCommentNode(mSlotNode));
        Assert.IsFalse(CommentNode.isCommentNode(mVarsNode));
    }
    
    private TestIsPINode(): void {
        const tagNode: TagNode = new TagNode('sometag');
        const textNode: TextNode = new TextNode();
        const commentNode: CommentNode = new CommentNode();
        const piNode: ProcessingInstructionNode = new ProcessingInstructionNode();
        const domNode: DocumentNode = new DocumentNode();
        const cdataNode: CDATANode = new CDATANode();
        const mFragmentNode = new MFragmentNode(new Map([['src', 'foo']]));
        const mComponentNode = new MComponentNode(new Map([['src', 'foo']]));
        const mContentNode = new MContentNode();
        const mSlotNode = new MSlotNode();
        const mVarsNode = new MVarNode();

        Assert.IsFalse(ProcessingInstructionNode.isProcessingInstructionNode(tagNode));
        Assert.IsFalse(ProcessingInstructionNode.isProcessingInstructionNode(textNode));
        Assert.IsFalse(ProcessingInstructionNode.isProcessingInstructionNode(commentNode));
        Assert.IsTrue(ProcessingInstructionNode.isProcessingInstructionNode(piNode));
        Assert.IsFalse(ProcessingInstructionNode.isProcessingInstructionNode(domNode));
        Assert.IsFalse(ProcessingInstructionNode.isProcessingInstructionNode(cdataNode));
        Assert.IsFalse(ProcessingInstructionNode.isProcessingInstructionNode(mFragmentNode));
        Assert.IsFalse(ProcessingInstructionNode.isProcessingInstructionNode(mComponentNode));
        Assert.IsFalse(ProcessingInstructionNode.isProcessingInstructionNode(mContentNode));
        Assert.IsFalse(ProcessingInstructionNode.isProcessingInstructionNode(mSlotNode));
        Assert.IsFalse(ProcessingInstructionNode.isProcessingInstructionNode(mVarsNode));
    }
    
    private TestIsDocumentNode(): void {
        const tagNode: TagNode = new TagNode('sometag');
        const textNode: TextNode = new TextNode();
        const commentNode: CommentNode = new CommentNode();
        const piNode: ProcessingInstructionNode = new ProcessingInstructionNode();
        const domNode: DocumentNode = new DocumentNode();
        const cdataNode: CDATANode = new CDATANode();
        const mFragmentNode = new MFragmentNode(new Map([['src', 'foo']]));
        const mComponentNode = new MComponentNode(new Map([['src', 'foo']]));
        const mContentNode = new MContentNode();
        const mSlotNode = new MSlotNode();
        const mVarsNode = new MVarNode();

        Assert.IsFalse(DocumentNode.isDocumentNode(tagNode));
        Assert.IsFalse(DocumentNode.isDocumentNode(textNode));
        Assert.IsFalse(DocumentNode.isDocumentNode(commentNode));
        Assert.IsFalse(DocumentNode.isDocumentNode(piNode));
        Assert.IsTrue(DocumentNode.isDocumentNode(domNode));
        Assert.IsFalse(DocumentNode.isDocumentNode(cdataNode));
        Assert.IsFalse(DocumentNode.isDocumentNode(mFragmentNode));
        Assert.IsFalse(DocumentNode.isDocumentNode(mComponentNode));
        Assert.IsFalse(DocumentNode.isDocumentNode(mContentNode));
        Assert.IsFalse(DocumentNode.isDocumentNode(mSlotNode));
        Assert.IsFalse(DocumentNode.isDocumentNode(mVarsNode));
    }

    private TestIsCdataNode(): void {
        const tagNode: TagNode = new TagNode('sometag');
        const textNode: TextNode = new TextNode();
        const commentNode: CommentNode = new CommentNode();
        const piNode: ProcessingInstructionNode = new ProcessingInstructionNode();
        const domNode: DocumentNode = new DocumentNode();
        const cdataNode: CDATANode = new CDATANode();
        const mFragmentNode = new MFragmentNode(new Map([['src', 'foo']]));
        const mComponentNode = new MComponentNode(new Map([['src', 'foo']]));
        const mContentNode = new MContentNode();
        const mSlotNode = new MSlotNode();
        const mVarsNode = new MVarNode();

        Assert.IsFalse(CDATANode.isCDATANode(tagNode));
        Assert.IsFalse(CDATANode.isCDATANode(textNode));
        Assert.IsFalse(CDATANode.isCDATANode(commentNode));
        Assert.IsFalse(CDATANode.isCDATANode(piNode));
        Assert.IsFalse(CDATANode.isCDATANode(domNode));
        Assert.IsTrue(CDATANode.isCDATANode(cdataNode));
        Assert.IsFalse(CDATANode.isCDATANode(mFragmentNode));
        Assert.IsFalse(CDATANode.isCDATANode(mComponentNode));
        Assert.IsFalse(CDATANode.isCDATANode(mContentNode));
        Assert.IsFalse(CDATANode.isCDATANode(mSlotNode));
        Assert.IsFalse(CDATANode.isCDATANode(mVarsNode));
    }

    private TestIsNodeWithChildren(): void {
        const tagNode: TagNode = new TagNode('sometag');
        const textNode: TextNode = new TextNode();
        const commentNode: CommentNode = new CommentNode();
        const piNode: ProcessingInstructionNode = new ProcessingInstructionNode();
        const domNode: DocumentNode = new DocumentNode();
        const cdataNode: CDATANode = new CDATANode();
        const mFragmentNode = new MFragmentNode(new Map([['src', 'foo']]));
        const mComponentNode = new MComponentNode(new Map([['src', 'foo']]));
        const mContentNode = new MContentNode();
        const mSlotNode = new MSlotNode();
        const mVarsNode = new MVarNode();

        Assert.IsTrue(NodeWithChildren.isNodeWithChildren(tagNode));
        Assert.IsFalse(NodeWithChildren.isNodeWithChildren(textNode));
        Assert.IsFalse(NodeWithChildren.isNodeWithChildren(commentNode));
        Assert.IsFalse(NodeWithChildren.isNodeWithChildren(piNode));
        Assert.IsTrue(NodeWithChildren.isNodeWithChildren(domNode));
        Assert.IsTrue(NodeWithChildren.isNodeWithChildren(cdataNode));
        Assert.IsTrue(NodeWithChildren.isNodeWithChildren(mFragmentNode));
        Assert.IsTrue(NodeWithChildren.isNodeWithChildren(mComponentNode));
        Assert.IsTrue(NodeWithChildren.isNodeWithChildren(mContentNode));
        Assert.IsTrue(NodeWithChildren.isNodeWithChildren(mSlotNode));
        Assert.IsTrue(NodeWithChildren.isNodeWithChildren(mVarsNode));
    }

    private TestIsNodeWithText(): void {
        const tagNode: TagNode = new TagNode('sometag');
        const textNode: TextNode = new TextNode();
        const commentNode: CommentNode = new CommentNode();
        const piNode: ProcessingInstructionNode = new ProcessingInstructionNode();
        const domNode: DocumentNode = new DocumentNode();
        const cdataNode: CDATANode = new CDATANode();
        const mFragmentNode = new MFragmentNode(new Map([['src', 'foo']]));
        const mComponentNode = new MComponentNode(new Map([['src', 'foo']]));
        const mContentNode = new MContentNode();
        const mSlotNode = new MSlotNode();
        const mVarsNode = new MVarNode();

        Assert.IsFalse(NodeWithText.isNodeWithText(tagNode));
        Assert.IsTrue(NodeWithText.isNodeWithText(textNode));
        Assert.IsTrue(NodeWithText.isNodeWithText(commentNode));
        Assert.IsFalse(NodeWithText.isNodeWithText(piNode));
        Assert.IsFalse(NodeWithText.isNodeWithText(domNode));
        Assert.IsFalse(NodeWithText.isNodeWithText(cdataNode));
        Assert.IsFalse(NodeWithText.isNodeWithText(mFragmentNode));
        Assert.IsFalse(NodeWithText.isNodeWithText(mComponentNode));
        Assert.IsFalse(NodeWithText.isNodeWithText(mContentNode));
        Assert.IsFalse(NodeWithText.isNodeWithText(mSlotNode));
        Assert.IsFalse(NodeWithText.isNodeWithText(mVarsNode));
    }

    private TestIsNodeWithData(): void {
        const tagNode: TagNode = new TagNode('sometag');
        const textNode: TextNode = new TextNode();
        const commentNode: CommentNode = new CommentNode();
        const piNode: ProcessingInstructionNode = new ProcessingInstructionNode();
        const domNode: DocumentNode = new DocumentNode();
        const cdataNode: CDATANode = new CDATANode();
        const mFragmentNode = new MFragmentNode(new Map([['src', 'foo']]));
        const mComponentNode = new MComponentNode(new Map([['src', 'foo']]));
        const mContentNode = new MContentNode();
        const mSlotNode = new MSlotNode();
        const mVarsNode = new MVarNode();

        Assert.IsFalse(NodeWithData.isNodeWithData(tagNode));
        Assert.IsFalse(NodeWithData.isNodeWithData(textNode));
        Assert.IsFalse(NodeWithData.isNodeWithData(commentNode));
        Assert.IsTrue(NodeWithData.isNodeWithData(piNode));
        Assert.IsFalse(NodeWithData.isNodeWithData(domNode));
        Assert.IsFalse(NodeWithData.isNodeWithData(cdataNode));
        Assert.IsFalse(NodeWithText.isNodeWithText(mFragmentNode));
        Assert.IsFalse(NodeWithText.isNodeWithText(mComponentNode));
        Assert.IsFalse(NodeWithText.isNodeWithText(mContentNode));
        Assert.IsFalse(NodeWithText.isNodeWithText(mSlotNode));
        Assert.IsFalse(NodeWithText.isNodeWithText(mVarsNode));
    }
    
    private TestIsMFragmentNode(): void {
        const tagNode: TagNode = new TagNode('sometag');
        const textNode: TextNode = new TextNode();
        const commentNode: CommentNode = new CommentNode();
        const piNode: ProcessingInstructionNode = new ProcessingInstructionNode();
        const domNode: DocumentNode = new DocumentNode();
        const cdataNode: CDATANode = new CDATANode();
        const mFragmentNode = new MFragmentNode(new Map([['src', 'foo']]));
        const mComponentNode = new MComponentNode(new Map([['src', 'foo']]));
        const mContentNode = new MContentNode();
        const mSlotNode = new MSlotNode();
        const mVarsNode = new MVarNode();

        Assert.IsFalse(MFragmentNode.isMFragmentNode(tagNode));
        Assert.IsFalse(MFragmentNode.isMFragmentNode(textNode));
        Assert.IsFalse(MFragmentNode.isMFragmentNode(commentNode));
        Assert.IsFalse(MFragmentNode.isMFragmentNode(piNode));
        Assert.IsFalse(MFragmentNode.isMFragmentNode(domNode));
        Assert.IsFalse(MFragmentNode.isMFragmentNode(cdataNode));
        Assert.IsTrue(MFragmentNode.isMFragmentNode(mFragmentNode));
        Assert.IsFalse(MFragmentNode.isMFragmentNode(mComponentNode));
        Assert.IsFalse(MFragmentNode.isMFragmentNode(mContentNode));
        Assert.IsFalse(MFragmentNode.isMFragmentNode(mSlotNode));
        Assert.IsFalse(MFragmentNode.isMFragmentNode(mVarsNode));
    }
    
    private TestIsMComponentNode(): void {
        const tagNode: TagNode = new TagNode('sometag');
        const textNode: TextNode = new TextNode();
        const commentNode: CommentNode = new CommentNode();
        const piNode: ProcessingInstructionNode = new ProcessingInstructionNode();
        const domNode: DocumentNode = new DocumentNode();
        const cdataNode: CDATANode = new CDATANode();
        const mFragmentNode = new MFragmentNode(new Map([['src', 'foo']]));
        const mComponentNode = new MComponentNode(new Map([['src', 'foo']]));
        const mContentNode = new MContentNode();
        const mSlotNode = new MSlotNode();
        const mVarsNode = new MVarNode();

        Assert.IsFalse(MComponentNode.isMComponentNode(tagNode));
        Assert.IsFalse(MComponentNode.isMComponentNode(textNode));
        Assert.IsFalse(MComponentNode.isMComponentNode(commentNode));
        Assert.IsFalse(MComponentNode.isMComponentNode(piNode));
        Assert.IsFalse(MComponentNode.isMComponentNode(domNode));
        Assert.IsFalse(MComponentNode.isMComponentNode(cdataNode));
        Assert.IsFalse(MComponentNode.isMComponentNode(mFragmentNode));
        Assert.IsTrue(MComponentNode.isMComponentNode(mComponentNode));
        Assert.IsFalse(MComponentNode.isMComponentNode(mContentNode));
        Assert.IsFalse(MComponentNode.isMComponentNode(mSlotNode));
        Assert.IsFalse(MComponentNode.isMComponentNode(mVarsNode));
    }
    
    private TestIsMSlotNode(): void {
        const tagNode: TagNode = new TagNode('sometag');
        const textNode: TextNode = new TextNode();
        const commentNode: CommentNode = new CommentNode();
        const piNode: ProcessingInstructionNode = new ProcessingInstructionNode();
        const domNode: DocumentNode = new DocumentNode();
        const cdataNode: CDATANode = new CDATANode();
        const mFragmentNode = new MFragmentNode(new Map([['src', 'foo']]));
        const mComponentNode = new MComponentNode(new Map([['src', 'foo']]));
        const mContentNode = new MContentNode();
        const mSlotNode = new MSlotNode();
        const mVarsNode = new MVarNode();

        Assert.IsFalse(MSlotNode.isMSlotNode(tagNode));
        Assert.IsFalse(MSlotNode.isMSlotNode(textNode));
        Assert.IsFalse(MSlotNode.isMSlotNode(commentNode));
        Assert.IsFalse(MSlotNode.isMSlotNode(piNode));
        Assert.IsFalse(MSlotNode.isMSlotNode(domNode));
        Assert.IsFalse(MSlotNode.isMSlotNode(cdataNode));
        Assert.IsFalse(MSlotNode.isMSlotNode(mFragmentNode));
        Assert.IsFalse(MSlotNode.isMSlotNode(mComponentNode));
        Assert.IsFalse(MSlotNode.isMSlotNode(mContentNode));
        Assert.IsTrue(MSlotNode.isMSlotNode(mSlotNode));
        Assert.IsFalse(MSlotNode.isMSlotNode(mVarsNode));
    }
    
    private TestIsMContentNode(): void {
        const tagNode: TagNode = new TagNode('sometag');
        const textNode: TextNode = new TextNode();
        const commentNode: CommentNode = new CommentNode();
        const piNode: ProcessingInstructionNode = new ProcessingInstructionNode();
        const domNode: DocumentNode = new DocumentNode();
        const cdataNode: CDATANode = new CDATANode();
        const mFragmentNode = new MFragmentNode(new Map([['src', 'foo']]));
        const mComponentNode = new MComponentNode(new Map([['src', 'foo']]));
        const mContentNode = new MContentNode();
        const mSlotNode = new MSlotNode();
        const mVarsNode = new MVarNode();

        Assert.IsFalse(MContentNode.isMContentNode(tagNode));
        Assert.IsFalse(MContentNode.isMContentNode(textNode));
        Assert.IsFalse(MContentNode.isMContentNode(commentNode));
        Assert.IsFalse(MContentNode.isMContentNode(piNode));
        Assert.IsFalse(MContentNode.isMContentNode(domNode));
        Assert.IsFalse(MContentNode.isMContentNode(cdataNode));
        Assert.IsFalse(MContentNode.isMContentNode(mFragmentNode));
        Assert.IsFalse(MContentNode.isMContentNode(mComponentNode));
        Assert.IsTrue(MContentNode.isMContentNode(mContentNode));
        Assert.IsFalse(MContentNode.isMContentNode(mSlotNode));
        Assert.IsFalse(MContentNode.isMContentNode(mVarsNode));
    }
    
    private TestIsMVarsNode(): void {
        const tagNode: TagNode = new TagNode('sometag');
        const textNode: TextNode = new TextNode();
        const commentNode: CommentNode = new CommentNode();
        const piNode: ProcessingInstructionNode = new ProcessingInstructionNode();
        const domNode: DocumentNode = new DocumentNode();
        const cdataNode: CDATANode = new CDATANode();
        const mFragmentNode = new MFragmentNode(new Map([['src', 'foo']]));
        const mComponentNode = new MComponentNode(new Map([['src', 'foo']]));
        const mContentNode = new MContentNode();
        const mSlotNode = new MSlotNode();
        const mVarsNode = new MVarNode();

        Assert.IsFalse(MVarNode.isMVarNode(tagNode));
        Assert.IsFalse(MVarNode.isMVarNode(textNode));
        Assert.IsFalse(MVarNode.isMVarNode(commentNode));
        Assert.IsFalse(MVarNode.isMVarNode(piNode));
        Assert.IsFalse(MVarNode.isMVarNode(domNode));
        Assert.IsFalse(MVarNode.isMVarNode(cdataNode));
        Assert.IsFalse(MVarNode.isMVarNode(mFragmentNode));
        Assert.IsFalse(MVarNode.isMVarNode(mComponentNode));
        Assert.IsFalse(MVarNode.isMVarNode(mContentNode));
        Assert.IsFalse(MVarNode.isMVarNode(mSlotNode));
        Assert.IsTrue(MVarNode.isMVarNode(mVarsNode));
    }

    // test set boilerplate
    readonly setName: string = 'NodeIsType';
    getTests(): Map<string, TestCallback> {
        return new Map<string, TestCallback>([
            ['IsTagNode', (): void => this.TestIsTagNode()],
            ['IsTextNode', (): void => this.TestIsTextNode()],
            ['IsCommentNode', (): void => this.TestIsCommentNode()],
            ['IsPINode', (): void => this.TestIsPINode()],
            ['IsDocumentNode', (): void => this.TestIsDocumentNode()],
            ['IsCdataNode', (): void => this.TestIsCdataNode()],
            ['IsNodeWithChildren', (): void => this.TestIsNodeWithChildren()],
            ['IsNodeWithText', (): void => this.TestIsNodeWithText()],
            ['IsNodeWithData', (): void => this.TestIsNodeWithData()],
            ['IsMFragmentNode', (): void => this.TestIsMFragmentNode()],
            ['IsMComponentNode', (): void => this.TestIsMComponentNode()],
            ['IsMSlotNode', (): void => this.TestIsMSlotNode()],
            ['IsMContentNode', (): void => this.TestIsMContentNode()],
            ['IsMVarsNode', (): void => this.TestIsMVarsNode()],
        ]);
    }
}
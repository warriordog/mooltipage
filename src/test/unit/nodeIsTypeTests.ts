import test, { ExecutionContext } from 'ava';
import { Node, TagNode, TextNode, CommentNode, ProcessingInstructionNode, MFragmentNode, MComponentNode, MContentNode, MSlotNode, MVarNode, DocumentNode, CDATANode, MImportNode, MScopeNode, MIfNode, MForNode, MForOfNode, MForInNode } from '../../lib';

function testNode(t: ExecutionContext, node: Node, isTag: boolean, isText: boolean, isComment: boolean, isPi: boolean, isDom: boolean, isCData: boolean, isMFragment: boolean, isMComponent: boolean, isMContent: boolean, isMSlot: boolean, isMVar: boolean, isMImport: boolean, isMScope: boolean, isMIf: boolean, isMFor: boolean, isMForOf: boolean, isMForIn: boolean) {
    t.is(TagNode.isTagNode(node), isTag);
    t.is(TextNode.isTextNode(node), isText);
    t.is(CommentNode.isCommentNode(node), isComment);
    t.is(ProcessingInstructionNode.isProcessingInstructionNode(node), isPi);
    t.is(DocumentNode.isDocumentNode(node), isDom);
    t.is(CDATANode.isCDATANode(node), isCData);
    t.is(MFragmentNode.isMFragmentNode(node), isMFragment);
    t.is(MComponentNode.isMComponentNode(node), isMComponent);
    t.is(MContentNode.isMContentNode(node), isMContent);
    t.is(MSlotNode.isMSlotNode(node), isMSlot);
    t.is(MVarNode.isMVarNode(node), isMVar);
    t.is(MImportNode.isMImportNode(node), isMImport);
    t.is(MScopeNode.isMScopeNode(node), isMScope);
    t.is(MIfNode.isMIfNode(node), isMIf);
    t.is(MForNode.isMForNode(node), isMFor);
    t.is(MForOfNode.isMForOfNode(node), isMForOf);
    t.is(MForInNode.isMForInNode(node), isMForIn);
}

test('[unit] TagNode is correct types', testNode, new TagNode('tagname'), true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false);
test('[unit] TextNode is correct types', testNode, new TextNode(), false, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false);
test('[unit] CommentNode is correct types', testNode, new CommentNode(), false, false, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false);
test('[unit] ProcessingInstructionNode is correct types', testNode, new ProcessingInstructionNode(), false, false, false, true, false, false, false, false, false, false, false, false, false, false, false, false, false);
test('[unit] DocumentNode is correct types', testNode, new DocumentNode(), false, false, false, false, true, false, false, false, false, false, false, false, false, false, false, false, false);
test('[unit] CDATANode is correct types', testNode, new CDATANode(), false, false, false, false, false, true, false, false, false, false, false, false, false, false, false, false, false);
test('[unit] MFragmentNode is correct types', testNode, new MFragmentNode('resPath'), true, false, false, false, false, false, true, false, false, false, false, false, false, false, false, false, false);
test('[unit] MComponentNode is correct types', testNode, new MComponentNode('resPath'), true, false, false, false, false, false, false, true, false, false, false, false, false, false, false, false, false);
test('[unit] MContentNode is correct types', testNode, new MContentNode(), true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, false);
test('[unit] MSlotNode is correct types', testNode, new MSlotNode(), true, false, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false);
test('[unit] MVarNode is correct types', testNode, new MVarNode(), true, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false, false);
test('[unit] MImportNode is correct types', testNode, new MImportNode('resPath', 'alias', false, false), true, false, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false);
test('[unit] MScopeNode is correct types', testNode, new MScopeNode(), true, false, false, false, false, false, false, false, false, false, false, false, true, false, false, false, false);
test('[unit] MIfNode is correct types', testNode, new MIfNode('{{ true }}'), true, false, false, false, false, false, false, false, false, false, false, false, false, true, false, false, false);
test('[unit] MForOfNode is correct types', testNode, new MForOfNode('{{ [] }}', 'var', undefined), true, false, false, false, false, false, false, false, false, false, false, false, false, false, true, true, false);
test('[unit] MForInNode is correct types', testNode, new MForInNode('{{ {} }}', 'var', undefined), true, false, false, false, false, false, false, false, false, false, false, false, false, false, true, false, true);
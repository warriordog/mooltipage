import test, {
    ExecutionContext
} from 'ava';
import {
    Node,
    TagNode,
    TextNode,
    CommentNode,
    ProcessingInstructionNode,
    MFragmentNode,
    MContentNode,
    MSlotNode,
    MVarNode,
    DocumentNode,
    CDATANode,
    MImportNode,
    MScopeNode,
    MIfNode,
    MForNode,
    MForOfNode,
    MForInNode,
    MDataNode,
    MimeType,
    CompiledStyleNode,
    InternalStyleNode,
    ExternalStyleNode,
    StyleNode,
    ScriptNode,
    CompiledScriptNode,
    InternalScriptNode,
    ExternalScriptNode,
    NodeWithText,
    UncompiledStyleNode,
    UncompiledScriptNode,
    UncompiledAnchorNode,
    CompiledAnchorNode,
    AnchorNode,
    MWhitespaceNodeMode,
    MWhitespaceNode
} from '../../lib';

function testNode(t: ExecutionContext, node: Node, isTag: boolean, isText: boolean, isComment: boolean, isPi: boolean, isDom: boolean, isCData: boolean, isMFragment: boolean, isMComponent: boolean, isMContent: boolean, isMSlot: boolean, isMVar: boolean, isMImport: boolean, isMImportFragment: boolean, isMImportComponent: boolean, isMScope: boolean, isMIf: boolean, isMFor: boolean, isMForOf: boolean, isMForIn: boolean, unused: boolean, isMData: boolean, isCompiledStyle: boolean, isInternalStyle: boolean, isExternalStyle: boolean, isStyle: boolean, isScript: boolean, isCompiledScript: boolean, isInternalScript: boolean, isExternalScript: boolean, isNodeWithText: boolean, isUncompiledStyleNode: boolean, isUncompiledScriptNode: boolean, isAnchorNode: boolean, isUncompiledAnchorNode: boolean, isCompiledAnchorNode: boolean, isMWhitespaceNode: boolean): void {
    t.is(TagNode.isTagNode(node), isTag);
    t.is(TextNode.isTextNode(node), isText);
    t.is(CommentNode.isCommentNode(node), isComment);
    t.is(ProcessingInstructionNode.isProcessingInstructionNode(node), isPi);
    t.is(DocumentNode.isDocumentNode(node), isDom);
    t.is(CDATANode.isCDATANode(node), isCData);
    t.is(MFragmentNode.isMFragmentNode(node), isMFragment);
    t.is(MContentNode.isMContentNode(node), isMContent);
    t.is(MSlotNode.isMSlotNode(node), isMSlot);
    t.is(MVarNode.isMVarNode(node), isMVar);
    t.is(MImportNode.isMImportNode(node), isMImport);
    t.is(MScopeNode.isMScopeNode(node), isMScope);
    t.is(MIfNode.isMIfNode(node), isMIf);
    t.is(MForNode.isMForNode(node), isMFor);
    t.is(MForOfNode.isMForOfNode(node), isMForOf);
    t.is(MForInNode.isMForInNode(node), isMForIn);
    t.is(MDataNode.isMDataNode(node), isMData);
    t.is(CompiledStyleNode.isCompiledStyleNode(node), isCompiledStyle);
    t.is(InternalStyleNode.isInternalStyleNode(node), isInternalStyle);
    t.is(ExternalStyleNode.isExternalStyleNode(node), isExternalStyle);
    t.is(StyleNode.isStyleNode(node), isStyle);
    t.is(ScriptNode.isScriptNode(node), isScript);
    t.is(CompiledScriptNode.isCompiledScriptNode(node), isCompiledScript);
    t.is(InternalScriptNode.isInternalScriptNode(node), isInternalScript);
    t.is(ExternalScriptNode.isExternalScriptNode(node), isExternalScript);
    t.is(NodeWithText.isNodeWithText(node), isNodeWithText);
    t.is(UncompiledStyleNode.isUncompiledStyleNode(node), isUncompiledStyleNode);
    t.is(UncompiledScriptNode.isUncompiledScriptNode(node), isUncompiledScriptNode);
    t.is(AnchorNode.isAnchorNode(node), isAnchorNode);
    t.is(UncompiledAnchorNode.isUncompiledAnchorNode(node), isUncompiledAnchorNode);
    t.is(CompiledAnchorNode.isCompiledAnchorNode(node), isCompiledAnchorNode);
    t.is(MWhitespaceNode.isMWhitespaceNode(node), isMWhitespaceNode);
}

test('TagNode is correct types', testNode, new TagNode('test'), true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false);
test('TextNode is correct types', testNode, new TextNode(), false, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false, false);
test('CommentNode is correct types', testNode, new CommentNode(), false, false, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false, false);
test('ProcessingInstructionNode is correct types', testNode, new ProcessingInstructionNode(), false, false, false, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false);
test('DocumentNode is correct types', testNode, new DocumentNode(), false, false, false, false, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false);
test('CDATANode is correct types', testNode, new CDATANode(), false, false, false, false, false, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false);
test('MFragmentNode is correct types', testNode, new MFragmentNode('resPath'), true, false, false, false, false, false, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false);
test('MContentNode is correct types', testNode, new MContentNode(), true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false);
test('MSlotNode is correct types', testNode, new MSlotNode(), true, false, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false);
test('MVarNode is correct types', testNode, new MVarNode(), true, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false);
test('MScopeNode is correct types', testNode, new MScopeNode(), true, false, false, false, false, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false);
test('MIfNode is correct types', testNode, new MIfNode('{{ true }}'), true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false);
test('MForOfNode is correct types', testNode, new MForOfNode('{{ [] }}', 'var', undefined), true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false);
test('MForInNode is correct types', testNode, new MForInNode('{{ {} }}', 'var', undefined), true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, false, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false);
test('MDataNode is correct types', testNode, new MDataNode(MimeType.JSON), true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false);
test('UncompiledStyleNode is correct types', testNode, new UncompiledStyleNode(), true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false, true, false, false, false, false, false);
test('InternalStyleNode is correct types', testNode, new InternalStyleNode(), true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, true, false, true, false, false, false, false, false, false, false, false, false, false, false);
test('ExternalStyleNode is correct types', testNode, new ExternalStyleNode('path.css'), true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, false, true, true, false, false, false, false, false, false, false, false, false, false, false);
test('UncompiledScriptNode is correct types', testNode, new UncompiledScriptNode(), true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false, true, false, false, false, false);
test('InternalScriptNode is correct types', testNode, new InternalScriptNode(), true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, true, true, false, false, false, false, false, false, false, false);
test('ExternalScriptNode is correct types', testNode, new ExternalScriptNode('path.css'), true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, true, false, true, false, false, false, false, false, false, false);
test('UncompiledAnchorNode is correct types', testNode, new UncompiledAnchorNode(), true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, true, false, false);
test('CompiledAnchorNode is correct types', testNode, new CompiledAnchorNode('foo.html'), true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, false, true, false);
test('MWhitespaceNode is correct types', testNode, new MWhitespaceNode(), true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true);
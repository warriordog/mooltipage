import { HtmlCompilerModule, HtmlCompilerContext } from '../htmlCompiler';
import {
    TagNode,
    CompiledStyleNode,
    InternalStyleNode,
    ExternalStyleNode,
    TextNode,
    StyleNodeBind,
    UncompiledStyleNode,
    MimeType
} from '../../..';
import {resolveResPath} from '../../../fs/pathUtils';

export class StyleModule implements HtmlCompilerModule {
    async enterNode(htmlContext: HtmlCompilerContext): Promise<void> {
        const pipelineContext = htmlContext.sharedContext.pipelineContext;

        if (InternalStyleNode.isInternalStyleNode(htmlContext.node)) {
            // internal (inline) CSS
            const src = pipelineContext.fragment.path;
            await compileStyle(htmlContext.node, htmlContext.node.styleContent, src, htmlContext);

        } else if (ExternalStyleNode.isExternalStyleNode(htmlContext.node)) {
            // external CSS
            const resPath = resolveResPath(htmlContext.node.src, pipelineContext.fragment.path);
            const styleContent = await pipelineContext.pipeline.getRawText(resPath, MimeType.CSS);
            await compileStyle(htmlContext.node, styleContent, htmlContext.node.src, htmlContext);
        }
    }
}

async function compileStyle(node: CompiledStyleNode, styleContent: string, src: string, htmlContext: HtmlCompilerContext): Promise<void> {
    switch (node.bind) {
        case StyleNodeBind.HEAD:
            compileStyleHead(node, styleContent, htmlContext);
            break;
        case StyleNodeBind.LINK:
            await compileStyleLink(node, src, styleContent, htmlContext);
            break;
        default:
            throw new Error(`Unknown StyleNodeBind value: '${ node.bind }'`);
        }
}

function compileStyleHead(currentNode: CompiledStyleNode, styleContent: string, htmlContext: HtmlCompilerContext): void {
    // create text to hold CSS
    const styleText = new TextNode(styleContent);
    // if this formatting should be skipped, then set whitespace sensitivity
    styleText.isWhitespaceSensitive = currentNode.skipFormat;

    // create style node
    const styleNode = new UncompiledStyleNode();
    styleNode.appendChild(styleText);

    // replace compile node
    currentNode.replaceSelf([ styleNode ]);
    htmlContext.setDeleted();
}

async function compileStyleLink(currentNode: CompiledStyleNode, src: string, styleContent: string, htmlContext: HtmlCompilerContext): Promise<void> {
    const rootResPath = htmlContext.sharedContext.pipelineContext.fragmentContext.rootResPath;

    // write external CSS
    const styleResPath = await htmlContext.sharedContext.pipelineContext.pipeline.linkResource(MimeType.CSS, styleContent, rootResPath);

    // create link
    const link = new TagNode('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', styleResPath);

    // replace
    currentNode.replaceSelf([ link ]);
    htmlContext.setDeleted();
}

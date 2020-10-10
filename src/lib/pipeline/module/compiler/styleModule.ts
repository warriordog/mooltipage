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
    enterNode(htmlContext: HtmlCompilerContext): void {
        const pipelineContext = htmlContext.sharedContext.pipelineContext;

        if (InternalStyleNode.isInternalStyleNode(htmlContext.node)) {
            // internal (inline) CSS
            const src = pipelineContext.fragment.path;
            this.compileStyle(htmlContext.node, htmlContext.node.styleContent, src, htmlContext);

        } else if (ExternalStyleNode.isExternalStyleNode(htmlContext.node)) {
            // external CSS
            const resPath = resolveResPath(htmlContext.node.src, pipelineContext.fragment.path);
            const styleContent = pipelineContext.pipeline.getRawText(resPath, MimeType.CSS);
            this.compileStyle(htmlContext.node, styleContent, htmlContext.node.src, htmlContext);
        }
    }

    compileStyle(node: CompiledStyleNode, styleContent: string, src: string, htmlContext: HtmlCompilerContext): void {
        switch (node.bind) {
            case StyleNodeBind.HEAD:
                this.compileStyleHead(node, styleContent, htmlContext);
                break;
            case StyleNodeBind.LINK: 
                this.compileStyleLink(node, src, styleContent, htmlContext);
                break;
            default:
                throw new Error(`Unknown StyleNodeBind value: '${ node.bind }'`);
        }
    }

    compileStyleHead(currentNode: CompiledStyleNode, styleContent: string, htmlContext: HtmlCompilerContext): void {
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

    compileStyleLink(currentNode: CompiledStyleNode, src: string, styleContent: string, htmlContext: HtmlCompilerContext): void {
        const rootResPath = htmlContext.sharedContext.pipelineContext.fragmentContext.rootResPath;

        // write external CSS
        const styleResPath = htmlContext.sharedContext.pipelineContext.pipeline.linkResource(MimeType.CSS, styleContent, rootResPath);

        // create link
        const link = new TagNode('link');
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('href', styleResPath);

        // replace
        currentNode.replaceSelf([ link ]);
        htmlContext.setDeleted();
    }
}

import { HtmlCompilerModule, HtmlCompilerContext } from '../htmlCompiler';
import { TagNode, CompiledStyleNode, InternalStyleNode, ExternalStyleNode, TextNode, StyleNodeBind, StyleNode } from '../../../dom/node';
import { MimeType } from '../../..';

export class StyleModule implements HtmlCompilerModule {
    enterNode(htmlContext: HtmlCompilerContext): void {
        if (InternalStyleNode.isInternalStyleNode(htmlContext.node)) {
            // internal (inline) CSS
            const src = htmlContext.pipelineContext.fragment.path;
            this.compileStyle(htmlContext.node, htmlContext.node.styleContent, src, htmlContext);

        } else if (ExternalStyleNode.isExternalStyleNode(htmlContext.node)) {
            // external CSS
            const styleContent = htmlContext.pipelineContext.pipeline.getRawText(htmlContext.node.src, MimeType.CSS);
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
                throw new Error(`Unknown StyleNodeBind value: '${ node.bind }'`)
        }
    }

    compileStyleHead(currentNode: CompiledStyleNode, styleContent: string, htmlContext: HtmlCompilerContext): void {
        // create style node
        const styleNode = new StyleNode(false);
        const styleText = new TextNode(styleContent);
        styleNode.appendChild(styleText);

        // replace compile node
        currentNode.replaceSelf([ styleNode ]);
        htmlContext.setDeleted();
    }

    compileStyleLink(currentNode: CompiledStyleNode, src: string, styleContent: string, htmlContext: HtmlCompilerContext): void {
        // write external CSS
        const styleResPath = htmlContext.pipelineContext.pipeline.linkResource(MimeType.CSS, styleContent, src);

        // create link
        const link = new TagNode('link');
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('href', styleResPath);

        // replace
        currentNode.replaceSelf([link]);
        htmlContext.setDeleted();
    }
}

import { HtmlCompilerModule, HtmlCompilerContext } from '../htmlCompiler';
import { InternalScriptNode, ExternalScriptNode, MimeType } from '../../..';

export class ScriptModule implements HtmlCompilerModule {
    enterNode(htmlContext: HtmlCompilerContext): void {
        if (InternalScriptNode.isInternalScriptNode(htmlContext.node)) {
            // compile internal <script>
            this.compileInternalScript(htmlContext.node, htmlContext);

        } else if (ExternalScriptNode.isExternalScriptNode(htmlContext.node)) {
            // compile external <script>
            this.compileExternalScript(htmlContext.node, htmlContext);
        }
    }

    compileInternalScript(node: InternalScriptNode, htmlContext: HtmlCompilerContext): void {
        this.compileScript(htmlContext, node.scriptContent);
    }
    compileExternalScript(node: ExternalScriptNode, htmlContext: HtmlCompilerContext): void {
        const scriptContent = htmlContext.sharedContext.pipelineContext.pipeline.getRawText(node.src, MimeType.JAVASCRIPT);
        this.compileScript(htmlContext, scriptContent);
    }

    compileScript(htmlContext: HtmlCompilerContext, scriptText: string): void {
        // execute in parent scope, if it exists. Otherwise use local scope
        const targetCompileData = htmlContext.parentContext ?? htmlContext;

        // create eval context
        const evalContext = targetCompileData.createEvalContext();

        // compile and execute
        htmlContext.sharedContext.pipelineContext.pipeline.compileScript(scriptText, evalContext);

        // remove when done
        htmlContext.node.removeSelf();
        htmlContext.setDeleted();
    }
}
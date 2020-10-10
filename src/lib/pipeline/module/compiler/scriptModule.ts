import { HtmlCompilerModule, HtmlCompilerContext } from '../htmlCompiler';
import { InternalScriptNode, ExternalScriptNode, MimeType } from '../../..';
import {resolveResPath} from '../../../fs/pathUtils';

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
        const pipelineContext = htmlContext.sharedContext.pipelineContext;

        const resPath = resolveResPath(node.src, pipelineContext.fragment.path);
        const scriptContent = pipelineContext.pipeline.getRawText(resPath, MimeType.JAVASCRIPT);
        this.compileScript(htmlContext, scriptContent);
    }

    compileScript(htmlContext: HtmlCompilerContext, scriptText: string): void {
        // create eval context. This will use parent scope if it exists, or else will fall back to current scope.
        const evalContext = htmlContext.createParentScopeEvalContext();

        // compile and execute
        htmlContext.sharedContext.pipelineContext.pipeline.compileScript(scriptText, evalContext);

        // remove when done
        htmlContext.node.removeSelf();
        htmlContext.setDeleted();
    }
}
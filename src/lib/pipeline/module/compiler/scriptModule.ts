import { HtmlCompilerModule, HtmlCompilerContext } from '../htmlCompiler';
import { InternalScriptNode, ExternalScriptNode, MimeType } from '../../..';
import {resolveResPath} from '../../../fs/pathUtils';

export class ScriptModule implements HtmlCompilerModule {
    async enterNode(htmlContext: HtmlCompilerContext): Promise<void> {
        if (InternalScriptNode.isInternalScriptNode(htmlContext.node)) {
            // compile internal <script>
            await compileInternalScript(htmlContext.node, htmlContext);

        } else if (ExternalScriptNode.isExternalScriptNode(htmlContext.node)) {
            // compile external <script>
            await compileExternalScript(htmlContext.node, htmlContext);
        }
    }
}

async function compileInternalScript(node: InternalScriptNode, htmlContext: HtmlCompilerContext): Promise<void> {
    await compileScript(htmlContext, node.scriptContent);
}

async function compileExternalScript(node: ExternalScriptNode, htmlContext: HtmlCompilerContext): Promise<void> {
    const pipelineContext = htmlContext.sharedContext.pipelineContext;

    const resPath = resolveResPath(node.src, pipelineContext.fragment.path);
    const scriptContent = await pipelineContext.pipeline.getRawText(resPath, MimeType.JAVASCRIPT);
    await compileScript(htmlContext, scriptContent);
}

async function compileScript(htmlContext: HtmlCompilerContext, scriptText: string): Promise<void> {
    // create eval context. This will use parent scope if it exists, or else will fall back to current scope.
    const evalContext = htmlContext.createParentScopeEvalContext();

    // compile and execute
    await htmlContext.sharedContext.pipelineContext.pipeline.compileScript(scriptText, evalContext);

    // remove when done
    htmlContext.node.removeSelf();
    htmlContext.setDeleted();
}
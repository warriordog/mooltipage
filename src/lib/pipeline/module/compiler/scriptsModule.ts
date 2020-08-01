import { HtmlCompilerModule, HtmlCompilerContext } from '../htmlCompiler';
import { MScriptNode } from '../../..';

export class ScriptsModule implements HtmlCompilerModule {
    enterNode(htmlContext: HtmlCompilerContext): void {
        // compile <m-script>
        if (MScriptNode.isMScriptNode(htmlContext.node)) {
            this.compileMScript(htmlContext.node, htmlContext);
        }
    }

    private compileMScript(mScript: MScriptNode, htmlContext: HtmlCompilerContext): void {
        // execute in parent scope, if it exists. Otherwise use local scope
        const targetCompileData = htmlContext.parentContext ?? htmlContext;

        // create eval context
        const evalContext = targetCompileData.createEvalContext();

        // compile
        htmlContext.pipelineContext.pipeline.compileExternalScript(mScript.src, evalContext);

        // remove when done
        mScript.removeSelf();
        htmlContext.setDeleted();
    }
}
import { HtmlCompilerModule, HtmlCompileData, MScriptNode } from '../../..';

export class ScriptsModule implements HtmlCompilerModule {
    enterNode(compileData: HtmlCompileData): void {
        // compile <m-script>
        if (MScriptNode.isMScriptNode(compileData.node)) {
            this.compileMScript(compileData.node, compileData);
        }
    }

    private compileMScript(mScript: MScriptNode, compileData: HtmlCompileData): void {
        // execute in parent scope, if it exists. Otherwise use local scope
        const targetCompileData = compileData.parentData ?? compileData;

        // create eval context
        const evalContext = targetCompileData.createEvalContext();

        // compile
        compileData.pipeline.compileExternalScript(mScript.src, evalContext);

        // remove when done
        mScript.removeSelf();
        compileData.setDeleted();
    }
}
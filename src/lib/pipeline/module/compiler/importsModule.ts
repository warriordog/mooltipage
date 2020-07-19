import { CompilerModule, CompileData, MImportNode, TagNode, MComponentNode, MFragmentNode } from "../../..";

/**
 * Process imports / aliases via m-import
 */
export class ImportsModule implements CompilerModule {
    compileFragment(compileData: CompileData): void {
        const dom = compileData.fragment.dom;

        // find imports
        const mImports: MImportNode[] = dom.findChildTagsByTagName('m-import');

        for (const mImport of mImports) {
            // find all usages
            const usages = dom.findChildTagsByTagName(mImport.as);
            for (const usage of usages) {
                // create replacement "basic" reference
                const replacement = this.createReplacementReference(mImport, usage);
                
                if (replacement != null) {
                    // replace in dom
                    usage.swapSelf(replacement);
                } else {
                    // if this usage cannot create a replacement, then remove the usage
                    usage.removeSelf();
                }
            }

            // remove from DOM
            mImport.removeSelf();
        }
    }

    private createReplacementReference(mImport: MImportNode, usage: TagNode): TagNode | null {
        // copy of attributes to give to replacement
        const attributes = new Map(usage.getAttributes().entries());

        // create replacement m-component
        if (mImport.component) {
            return new MComponentNode(mImport.src, attributes);
        }

        // create replacement m-fragment
        if (mImport.fragment) {
            return new MFragmentNode(mImport.src, attributes);
        }

        // import cannot be replaced
        return null;
    }
}
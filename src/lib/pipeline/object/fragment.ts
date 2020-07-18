import { DocumentNode } from "../..";

/**
 * A fragment of HTML that can be processed by the pipeline.
 * Does not exist post-compilation.
 * Can be cloned to support caching.
 */
export class Fragment {
    /**
     * Path to fragment, relative to source
     */
    readonly resPath: string;

    /**
     * Page Document
     */
    readonly dom: DocumentNode;

    constructor(resPath: string, dom: DocumentNode) {
        this.resPath = resPath;
        this.dom = dom;
    }

    /**
     * Clone this fragment
     */
    clone(): Fragment {
        // clone the DOM to get a new instance
        const newDom: DocumentNode = this.dom.clone();

        // create new fragment instance
        const newFragment = new Fragment(this.resPath, newDom);

        return newFragment;
    }
}
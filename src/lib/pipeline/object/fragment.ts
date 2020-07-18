import { DocumentNode } from '../../dom/node';

export class Fragment {
    readonly resPath: string;
    readonly dom: DocumentNode;

    constructor(resPath: string, dom: DocumentNode) {
        this.resPath = resPath;
        this.dom = dom;
    }

    clone(): Fragment {
        // clone the DOM to get a new instance
        const newDom: DocumentNode = this.dom.clone();

        // create new fragment instance
        const newFragment = new Fragment(this.resPath, newDom);

        return newFragment;
    }
}
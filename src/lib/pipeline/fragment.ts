import { DocumentNode } from '../dom/node';

export class Fragment {
    readonly resId: string;
    readonly dom: DocumentNode;

    constructor(resId: string, dom: DocumentNode) {
        this.resId = resId;
        this.dom = dom;
    }

    clone(): Fragment {
        // clone the DOM to get a new instance
        const newDom: DocumentNode = this.dom.clone();

        // create new fragment instance
        const newFragment = new Fragment(this.resId, newDom);

        return newFragment;
    }
}
import { Fragment } from "./fragment";
import { DocumentNode } from '../dom/node';

export class Page extends Fragment {
    constructor(resId: string, dom: DocumentNode) {
        super(resId, dom);
    }

    clone(): Page {
        // clone the DOM to get a new instance
        const newDom: DocumentNode = this.dom.clone();

        // create new page instance
        const newPage = new Page(this.resId, newDom);

        return newPage;
    }
}
import { Fragment } from "./fragment";
import { Dom } from './dom';

export class Page extends Fragment {
    constructor(resId: string, dom: Dom) {
        super(resId, dom);
    }

    clone(): Page {
        // clone the DOM to get a new instance
        const newDom: Dom = this.cloneDom();

        // create new page instance
        const newPage = new Page(this.resId, newDom);

        return newPage;
    }
}
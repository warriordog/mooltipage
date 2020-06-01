import { Dom } from './dom';
import * as DomTools from '../util/domTools';

export class Fragment {
    readonly resId: string;
    readonly dom: Dom;

    constructor(resId: string, dom: Dom) {
        this.resId = resId;
        this.dom = dom;
    }

    clone(): Fragment {
        // clone the DOM to get a new instance
        const newDom: Dom = this.cloneDom();

        // create new fragment instance
        const newFragment = new Fragment(this.resId, newDom);

        return newFragment;
    }

    cloneDom(): Dom {
        return DomTools.cloneNodes(this.dom, true);
    }
}
export default class Fragment {
    readonly resId: string;
    readonly dom: DocumentFragment;

    constructor(resId: string, dom: DocumentFragment) {
        this.resId = resId;
        this.dom = dom;
    }

    cloneDom(): DocumentFragment {
        return this.dom.cloneNode(true) as DocumentFragment;
    }
}
export default class Fragment {
    readonly resId: string;
    readonly dom: DocumentFragment;

    isPage: boolean = false;
    isExported: boolean = false;
    exportPath?: string = undefined;

    constructor(resId: string, dom: DocumentFragment) {
        this.resId = resId;
        this.dom = dom;
    }

    cloneDom(): DocumentFragment {
        return this.dom.cloneNode(true) as DocumentFragment;
    }

    createCopyWithNewDom(newDom: DocumentFragment) {
        const newFragment: Fragment = new Fragment(this.resId, newDom);

        newFragment.isPage = this.isPage;
        newFragment.isExported = this.isExported;
        newFragment.exportPath = this.exportPath;

        return newFragment;
    }
}
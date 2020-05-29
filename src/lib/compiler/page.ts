export default class Page {
    readonly resId: string;
    readonly dom: Document;

    constructor(resId: string, dom: Document) {
        this.resId = resId;
        this.dom = dom;
    }

    cloneDom(): Document {
        return this.dom.cloneNode(true) as Document;
    }
}
import { DocumentNode } from '../..';

/**
 * A compiled or compiling page
 */
export class Page {
    /**
     * Path to page, relative to both source and destination
     */
    readonly resPath: string;

    /**
     * Page document
     */
    readonly dom: DocumentNode;

    /**
     * Serialized and formatted HTML representation of the page
     */
    readonly html: string;

    constructor(resPath: string, dom: DocumentNode, html: string) {
        this.resPath = resPath;
        this.dom = dom;
        this.html = html;
    }
}
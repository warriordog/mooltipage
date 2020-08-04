import { DomParser } from '../../dom/domParser';
import { Fragment, DocumentNode } from '../..';

/**
 * Provides input parsing functionality to the pipeline
 */
export class ResourceParser {
    private readonly domParser: DomParser;

    constructor() {
        this.domParser = new DomParser();
    }

    /**
     * Parse HTML text as a fragment
     * @param resPath Source path
     * @param html HTML content
     * @returns a Fragment instance parsed from the HTML
     */
    parseFragment(resPath: string, html: string): Fragment {
        // parse HTML
        const dom: DocumentNode = this.domParser.parseDom(html);

        // create fragment
        return {
            path: resPath,
            dom: dom
        };
    }
}
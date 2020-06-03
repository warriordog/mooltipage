import { Pipeline } from "../pipeline/pipeline";
import { Fragment } from "../pipeline/fragment";
import { Page } from "../pipeline/page";
import { DocumentNode } from '../dom/node';
import { Parser } from 'htmlparser2';
import { DomParser } from '../dom/domParser';

export class HtmlParser {
    private readonly pipeline: Pipeline;

    constructor(pipeline: Pipeline) {
        this.pipeline = pipeline;
    }

    parseFragment(resId: string, html: string): Fragment {
        // parse HTML
        const dom: DocumentNode = this.parseDom(resId, html);

        // create fragment
        return new Fragment(resId, dom);
    }

    parsePage(resId: string, html: string): Page {
        // parse HTML
        const dom: DocumentNode = this.parseDom(resId, html);

        // create page
        return new Page(resId, dom);
    }

    private parseDom(resId: string, html: string): DocumentNode {
        // set up handler
        const handler: DomParser = new DomParser();

        // create parser
        const parser: Parser = new Parser(handler);

        // process html
        parser.write(html);
        parser.end();

        // verify roots
        if (handler.dom == null) {
            throw new Error(`No dom was generated for resource ${resId}`);
        }

        return handler.dom;
    }
}
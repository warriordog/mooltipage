import { Pipeline } from "../pipeline/pipeline";
import { Fragment } from "../pipeline/fragment";
import { Page } from "../pipeline/page";
import { Dom } from '../pipeline/dom';
import { Parser } from 'htmlparser2';
import DomHandler, { Node } from 'domhandler';

export class HtmlParser {
    private readonly pipeline: Pipeline;

    constructor(pipeline: Pipeline) {
        this.pipeline = pipeline;
    }

    parseFragment(resId: string, html: string): Fragment {
        // parse HTML
        const dom: Dom = this.parseDom(resId, html);

        // create fragment
        return new Fragment(resId, dom);
    }

    parsePage(resId: string, html: string): Page {
        // parse HTML
        const dom: Dom = this.parseDom(resId, html);

        // create page
        return new Page(resId, dom);
    }

    private parseDom(resId: string, html: string): Dom {
        let dom: Node[] | null = null;

        // set up handler
        const handler: DomHandler = new DomHandler((error: Error | null, result: Node[]) => {
            if (error != null) {
                throw error;
            }
            
            if (dom != null) {
                throw new Error(`DomHandler parsed multiple doms for resource ${resId}`);
            }

            dom = result;
        });

        // create parser
        const parser: Parser = new Parser(handler);

        // process html
        parser.write(html);
        parser.end();

        // verify dom
        if (dom == null) {
            throw new Error(`No dom was generated for resource ${resId}`);
        }

        return dom;
    }
}
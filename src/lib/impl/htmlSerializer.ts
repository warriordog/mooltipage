import { Page } from "../pipeline/page";
import { Pipeline } from "../pipeline/pipeline";
import * as DomUtils from 'domutils';

export class HtmlSerializer {
    private readonly pipeline: Pipeline;

    constructor(pipeline: Pipeline) {
        this.pipeline = pipeline;
    }
    
    serializePage(page: Page): string {
        return DomUtils.getOuterHTML(page.dom);
    }
}
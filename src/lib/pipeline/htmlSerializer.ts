import { Pipeline } from "./pipeline";
import { DomSerializer } from '../dom/domSerializer';
import { Page } from "./object/page";

export class HtmlSerializer {
    private readonly pipeline: Pipeline;
    private readonly serializer: DomSerializer;

    constructor(pipeline: Pipeline) {
        this.pipeline = pipeline;
        this.serializer = new DomSerializer();
    }
    
    serializePage(page: Page): string {
        return this.serializer.serialize(page.dom);
    }
}
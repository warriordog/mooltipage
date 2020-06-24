import { Pipeline } from "./pipeline";
import { DomSerializer } from '../dom/domSerializer';
import { Fragment } from "./object/fragment";

export class HtmlSerializer {
    private readonly pipeline: Pipeline;
    private readonly serializer: DomSerializer;

    constructor(pipeline: Pipeline) {
        this.pipeline = pipeline;
        this.serializer = new DomSerializer();
    }
    
    serializeFragment(fragment: Fragment): string {
        return this.serializer.serialize(fragment.dom);
    }
}
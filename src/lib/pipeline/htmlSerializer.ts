import { DomSerializer } from '../dom/domSerializer';
import { Page } from "./object/page";

export class HtmlSerializer {
    private readonly serializer: DomSerializer;

    constructor() {
        this.serializer = new DomSerializer();
    }
    
    serializePage(page: Page): string {
        return this.serializer.serialize(page.dom);
    }
}
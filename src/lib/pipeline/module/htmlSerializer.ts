import { DomSerializer, Page } from '../..';

/**
 * Provides HTML serialization support to the pipeline
 */
export class HtmlSerializer {
    private readonly serializer: DomSerializer;

    constructor() {
        this.serializer = new DomSerializer();
    }
    
    /**
     * Serialize a page into HTML
     * @param page Page to serialialize
     * @returns HTML representing the page contents
     */
    serializePage(page: Page): string {
        return this.serializer.serialize(page.dom);
    }
}
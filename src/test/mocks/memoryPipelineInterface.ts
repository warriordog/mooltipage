import { Pipeline, HtmlSource, HtmlDestination } from '../../main/compiler/pipeline';

export default class MemoryPipelineInterface implements HtmlSource, HtmlDestination {
    htmlSource: Map<string, string> = new Map<string, string>();
    htmlDestination: Map<string, string> = new Map<string, string>();

    clear() {
        this.htmlSource = new Map<string, string>();
        this.htmlDestination = new Map<string, string>();
    }

    readHtml(resId: string, pipeline: Pipeline): string {
        if (this.htmlSource.has(resId)) {
            const html = this.htmlSource.get(resId);

            if (html == undefined) {
                throw new Error(`Stored HTML for resource ${resId} is undefined`);
            }

            return html;
        } else {
            throw new Error(`Unable to resolve HTML resource ${resId}`);
        }
    }

    writeHtml(resId: string, content: string, pipeline: Pipeline): void {
       this.htmlDestination.set(resId, content);
    }

}
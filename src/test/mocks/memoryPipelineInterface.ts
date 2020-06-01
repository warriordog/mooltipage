import { HtmlSource } from '../../lib/pipeline/htmlSource';
import { HtmlDestination } from '../../lib/pipeline/htmlDestination';

export default class MemoryPipelineInterface implements HtmlSource, HtmlDestination {
    htmlSource: Map<string, string> = new Map<string, string>();
    htmlDestination: Map<string, string> = new Map<string, string>();

    clear(): void {
        this.htmlSource = new Map<string, string>();
        this.htmlDestination = new Map<string, string>();
    }

    hasDestination(resId: string): boolean {
        return this.htmlDestination.has(resId);
    }

    getDestination(resId: string): string {
        if (!this.htmlDestination.has(resId)) {
            throw new Error(`Destination resource not found: '${resId}'`);
        }

        const html = this.htmlDestination.get(resId);
        if (html == undefined) {
            throw new Error(`Destination resource is undefined: '${resId}'`);
        }

        return html
    }

    getHtml(resId: string): string {
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

    writeHtml(resId: string, content: string): void {
       this.htmlDestination.set(resId, content);
    }

}
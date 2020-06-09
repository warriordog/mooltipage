export interface PipelineInterface {
    writeHtml(resId: string, html: string): void;
    getHtml(resId: string): string;
}
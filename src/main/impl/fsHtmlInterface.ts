import { HtmlSource, Pipeline, HtmlDestination } from '../compiler/pipeline';
import fs from 'fs';
import path from 'path';

export default class FsHtmlInterface implements HtmlSource, HtmlDestination {
    private readonly sourcePath: string | null;
    private readonly destinationPath: string | null;

    constructor(sourcePath: string | null, destinationPath: string | null) {
        this.sourcePath = sourcePath;
        this.destinationPath = destinationPath;
    }

    getHtml(resId: string): string {
        const htmlPath = this.resolvePath(this.sourcePath, resId);

        return fs.readFileSync(htmlPath, "utf-8");
    }

    writeHtml(resId: string, content: string): void {
        const htmlPath = this.resolvePath(this.destinationPath, resId);

        fs.writeFileSync(htmlPath, content);
    }

    private resolvePath(directory: string | null, resId: string): string {
        if (directory != null) {
            return path.resolve(__dirname, directory, resId);
        } else {
            return path.resolve(__dirname, resId);
        }
    }
}
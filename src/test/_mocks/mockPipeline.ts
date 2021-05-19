import { MemoryPipelineInterface } from './memoryPipelineInterface';
import { StandardPipeline } from '../../lib/pipeline/standardPipeline';
import { Page, Fragment, HtmlFormatter, MimeType } from '../../lib';
import Path
    from 'path';
import {fixPathSeparators} from '../../lib/fs/pathUtils';

export class MockPipeline extends StandardPipeline {
    readonly mockRawTexts: Array<[string, MimeType, string]> = [];

    readonly mockPi: MemoryPipelineInterface;

    constructor(pi = new MemoryPipelineInterface(), htmlFormatter?: HtmlFormatter) {
        super(pi, htmlFormatter);
        this.mockPi = pi;
    }

    compilePage(): Promise<Page> {
        throw new Error('Not implemented');
    }

    compileFragment(): Promise<Fragment> {
        throw new Error('Not implemented');
    }

    compileExpression(): Promise<unknown> {
        throw new Error('Not implemented');
    }

    compileCss(): string {
        throw new Error('Not implemented');
    }

    linkResource(): Promise<string> {
        throw new Error('Not implemented');
    }
    
    getRawText(resPath: string, mimeType: MimeType): Promise<string> {
        resPath = normalizeResPath(resPath);

        const rawText = this.mockRawTexts.find(text => text[0] === resPath && text[1] === mimeType);
        if (rawText !== undefined) {
            return Promise.resolve(rawText[2]);
        } else {
            throw new Error(`No mock defined for getRawText(resPath="${ resPath }", resourceType="${ mimeType }")`);
        }
    }

    reset(): void {
        // do nothing
    }
}

function normalizeResPath(resPath: string): string {
    return Path.normalize(fixPathSeparators(resPath));
}
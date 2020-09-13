import { MemoryPipelineInterface } from './memoryPipelineInterface';
import { StandardPipeline } from '../../lib/pipeline/standardPipeline';
import { Page, Fragment, HtmlFormatter, MimeType } from '../../lib';
import {fixSep} from '../_util/testFsUtils';
import Path
    from 'path';

export class MockPipeline extends StandardPipeline {
    readonly mockRawTexts: Array<[string, MimeType, string]> = [];

    readonly mockPi: MemoryPipelineInterface;

    constructor(pi?: MemoryPipelineInterface, htmlFormatter?: HtmlFormatter) {
        super((pi = pi ?? new MemoryPipelineInterface()), htmlFormatter);
        this.mockPi = pi;
    }

    compilePage(): Page {
        throw new Error('Not implemented');
    }

    compileFragment(): Fragment {
        throw new Error('Not implemented');
    }

    compileExpression(): unknown {
        throw new Error('Not implemented');
    }

    compileCss(): string {
        throw new Error('Not implemented');
    }

    linkResource(): string {
        throw new Error('Not implemented');
    }
    
    getRawText(resPath: string, mimeType: MimeType): string {
        resPath = normalizeResPath(resPath);

        const rawText = this.mockRawTexts.find(text => text[0] === resPath && text[1] === mimeType);
        if (rawText != undefined) {
            return rawText[2];
        } else {
            throw new Error(`No mock defined for getRawText(resPath="${ resPath }", resourceType="${ mimeType }")`);
        }
    }

    reset(): void {
        // do nothing
    }
}

function normalizeResPath(resPath: string): string {
    return Path.normalize(fixSep(resPath));
}
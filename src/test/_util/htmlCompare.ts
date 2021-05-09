import { ExecutionContext } from 'ava';
import { MemoryPipelineInterface } from '../_mocks/memoryPipelineInterface';
import { StandardPipeline } from '../../lib/pipeline/standardPipeline';
import {
    StandardHtmlFormatter,
    MinimizedFormatterPreset
} from '../../lib/pipeline/module/standardHtmlFormatter';

export async function compareFragmentMacro(t: ExecutionContext, fragmentHtml: string, expectedHtml: string, sources?: Array<[string, string]>): Promise<void> {
    // set up pipeline
    const pi = new MemoryPipelineInterface();
    pi.setSourceHtml('frag.html', fragmentHtml);
    if (sources !== undefined) {
        sources.forEach(source => pi.setSourceHtml(source[0], source[1]));
    }
    const pipeline = new StandardPipeline(pi, new StandardHtmlFormatter(MinimizedFormatterPreset));

    // run build
    const fragment = await pipeline.compileFragment('frag.html');
    const html = fragment.dom.toHtml();

    // check output
    t.is(html, expectedHtml);
}
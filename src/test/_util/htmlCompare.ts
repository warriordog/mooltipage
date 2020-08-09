import { ExecutionContext } from 'ava';
import { MemoryPipelineInterface } from '../_mocks/memoryPipelineInterface';
import { StandardPipeline } from '../../lib/pipeline/standardPipeline';
import { StandardHtmlFormatter, StandardHtmlFormatterMode } from '../../lib/pipeline/module/standardHtmlFormatter';

export function comparePageMacro(t: ExecutionContext, pageHtml: string, expectedHtml: string, sources?: [string, string][]): void {
    // set up pipeline
    const pi = new MemoryPipelineInterface();
    pi.setSourceHtml('page.html', pageHtml);
    if (sources != undefined) {
        sources.forEach(source => pi.setSourceHtml(source[0], source[1]));
    }
    const pipeline = new StandardPipeline(pi, new StandardHtmlFormatter(StandardHtmlFormatterMode.MINIMIZED));

    // run build
    const output = pipeline.compilePage('page.html');

    // check output
    t.is(output.html, expectedHtml);
}

export function compareFragmentMacro(t: ExecutionContext, fragmentHtml: string, expectedHtml: string, sources?: [string, string][]): void {
    // set up pipeline
    const pi = new MemoryPipelineInterface();
    pi.setSourceHtml('frag.html', fragmentHtml);
    if (sources != undefined) {
        sources.forEach(source => pi.setSourceHtml(source[0], source[1]));
    }
    const pipeline = new StandardPipeline(pi, new StandardHtmlFormatter(StandardHtmlFormatterMode.MINIMIZED));

    // run build
    const fragment = pipeline.compileFragment('frag.html');
    const html = fragment.dom.toHtml();

    // check output
    t.is(html, expectedHtml);
}
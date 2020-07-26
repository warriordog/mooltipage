import { ExecutionContext } from "ava";
import { MemoryPipelineInterface } from "../_mocks/memoryPipelineInterface";
import { Pipeline, BasicHtmlFormatter } from "../../lib";

export function comparePageMacro(t: ExecutionContext, page: string, expected: string, sources?: [string, string][]): void {
    // set up pipeline
    const pi = new MemoryPipelineInterface();
    pi.setSourceHtml('page.html', page);
    if (sources != undefined) {
        sources.forEach(source => pi.setSourceHtml(source[0], source[1]));
    }
    const pipeline = new Pipeline(pi, new BasicHtmlFormatter(false));

    // run build
    const output = pipeline.compilePage('page.html');

    // check output
    t.is(output.html, expected);
}

export function compareFragmentMacro(t: ExecutionContext, fragment: string, expected: string, sources?: [string, string][]): void {
    // set up pipeline
    const pi = new MemoryPipelineInterface();
    pi.setSourceHtml('page.html', '<!DOCTYPE html><html><head></head><body><m-fragment src="frag.html" /></body></html>');
    pi.setSourceHtml('frag.html', fragment);
    if (sources != undefined) {
        sources.forEach(source => pi.setSourceHtml(source[0], source[1]));
    }
    const pipeline = new Pipeline(pi, new BasicHtmlFormatter(false));

    // run build
    const output = pipeline.compilePage('page.html');

    // check output
    const computedExpected = `<!DOCTYPE html><html><head></head><body>${expected}</body></html>`
    t.is(output.html, computedExpected);
}

export function compareComponentMacro(t: ExecutionContext, component: string, expected: string, sources?: [string, string][]): void {
    // set up pipeline
    const pi = new MemoryPipelineInterface();
    pi.setSourceHtml('page.html', '<!DOCTYPE html><html><head></head><body><m-component src="component.html" /></body></html>');
    pi.setSourceHtml('component.html', component);
    if (sources != undefined) {
        sources.forEach(source => pi.setSourceHtml(source[0], source[1]));
    }
    const pipeline = new Pipeline(pi, new BasicHtmlFormatter(false));

    // run build
    const output = pipeline.compilePage('page.html');

    // check output
    const computedExpected = `<!DOCTYPE html><html><head></head><body>${expected}</body></html>`
    t.is(output.html, computedExpected);
}
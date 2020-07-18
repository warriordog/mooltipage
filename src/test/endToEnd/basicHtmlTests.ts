import test, { ExecutionContext } from 'ava';
import { Pipeline } from '../../lib/index';
import { MemoryPipelineInterface } from '../_mocks/memoryPipelineInterface';

const PAGE_MIN = `<!DOCTYPE html><html lang="en"><head><title>Page</title></head><body><div class="foo"><p>Hello</p><br /><p>World!</p></div></body></html>`;
const PAGE_PRETTY = `
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <title>Page</title>
        </head>
        <body>
            <div class="foo">
                <p>Hello</p>
                <br />
                <p>World!</p>
            </div>
        </body>
    </html>
`;

function testHtml(t: ExecutionContext, resPath: string, expected: string): void {
    // set up pipeline
    const pi = new MemoryPipelineInterface();
    pi.setSourceHtml('pageMin.html', PAGE_MIN);
    pi.setSourceHtml('pagePretty.html', PAGE_PRETTY);
    const pipeline = new Pipeline(pi);

    // run build
    const output = pipeline.compilePage(resPath);

    // check output
    t.is(output.html, expected);
}

test('[endToEnd] Raw HTML is passed through pipeline unchanged (minimized)', testHtml, 'pageMin.html', PAGE_MIN);
test('[endToEnd] Raw HTML is passed through pipeline unchanged (pretty)', testHtml, 'pagePretty.html', PAGE_PRETTY);


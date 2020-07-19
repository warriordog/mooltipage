import test, { ExecutionContext } from 'ava';
import { BasicHtmlFormatter, DomParser, Page, HtmlSerializer } from '../../lib';

function testPrettyFormat(t: ExecutionContext, input: string, expected: string) {
    const parser = new DomParser();
    const serializer = new HtmlSerializer();

    const dom = parser.parseDom(input);
    const page = new Page('test.html', dom);

    const formatter = new BasicHtmlFormatter(true, '\n', '    ');
    formatter.formatPage(page);

    const output1 = serializer.serializePage(page);
    const output2 = formatter.formatHtml(page.resPath, output1);

    t.is(output2, expected);
}

test('[unit] BasicHtmlFormatter pretty mode cleans whitespace', testPrettyFormat, 
`
<!DOCTYPE HTML>
<html>
<head>
                <title>
                </title>
</head>
    <body>
        <div>
    </div>
</body>
            </html>
`,
`<!DOCTYPE HTML>
<html>
    <head>
        <title></title>
    </head>
    <body>
        <div></div>
    </body>
</html>`);

test('[unit] BasicHtmlFormatter pretty mode breaks up appended elements', testPrettyFormat,
`<!DOCTYPE HTML><html><head><title></title></head><body><div></div></body></html>`,
`<!DOCTYPE HTML>
<html>
    <head>
        <title></title>
    </head>
    <body>
        <div></div>
    </body>
</html>`);

test('[unit] BasicHtmlFormatter pretty mode inlines single-line text', testPrettyFormat,
`<!DOCTYPE HTML><html><head><title>
There is only one line of text, so this should be inlined.

</title></head><body><div></div></body></html>`,
`<!DOCTYPE HTML>
<html>
    <head>
        <title>There is only one line of text, so this should be inlined.</title>
    </head>
    <body>
        <div></div>
    </body>
</html>`);


test('[unit] BasicHtmlFormatter pretty mode does not inline multi-line text', testPrettyFormat,
`<!DOCTYPE HTML><html><head><title></title></head><body><div>
     There are multiple lines of text here, 
     so this should not be inlined.
</div></body></html>`,
`<!DOCTYPE HTML>
<html>
    <head>
        <title></title>
    </head>
    <body>
        <div>
            There are multiple lines of text here, so this should not be inlined.
        </div>
    </body>
</html>`
);
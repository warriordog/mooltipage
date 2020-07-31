import test, { ExecutionContext } from 'ava';
import { HtmlFormatter, HtmlFormatterMode, DomParser } from '../../lib';

function testFormat(t: ExecutionContext, input: string, expected: string, mode: HtmlFormatterMode = HtmlFormatterMode.NONE) {
    const parser = new DomParser();

    const dom = parser.parseDom(input);

    const formatter = new HtmlFormatter(mode, '\n', '    ');
    formatter.formatDom(dom);

    const output1 = dom.toHtml();
    const output2 = formatter.formatHtml(output1);

    t.is(output2, expected);
}

test('[unit] HtmlFormatter PRETTY mode cleans whitespace', testFormat, 
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
</html>`,
HtmlFormatterMode.PRETTY);

test('[unit] HtmlFormatter PRETTY mode breaks up appended elements', testFormat,
`<!DOCTYPE HTML><html><head><title></title></head><body><div></div></body></html>`,
`<!DOCTYPE HTML>
<html>
    <head>
        <title></title>
    </head>
    <body>
        <div></div>
    </body>
</html>`,
HtmlFormatterMode.PRETTY);

test('[unit] HtmlFormatter PRETTY mode inlines single-line text', testFormat,
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
</html>`,
HtmlFormatterMode.PRETTY);


test('[unit] HtmlFormatter PRETTY mode does not inline multi-line text', testFormat,
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
</html>`,
HtmlFormatterMode.PRETTY);

test('[unit] HtmlFormatter MINIMIZED mode compacts whitespace', testFormat,
`<!DOCTYPE HTML>
<html>
    <head>
        <title></title>
    </head>
    <body>
        <div></div>
    </body>
</html>`,
'<!DOCTYPE HTML><html><head><title></title></head><body><div></div></body></html>',
HtmlFormatterMode.MINIMIZED);

test('[unit] HtmlFormatter NONE mode does not change HTML', testFormat,
`<!DOCTYPE HTML>
<html>
<head>
        <title>
        
        </title></head>
    <body><div>
</div>
    </body>
</html>`,
`<!DOCTYPE HTML>
<html>
<head>
        <title>
        
        </title></head>
    <body><div>
</div>
    </body>
</html>`,
HtmlFormatterMode.NONE);

test('[unit] HtmlFormatter PRETTY mode trims trailing space', testFormat,
`   
<!DOCTYPE HTML><html><head><title></title></head><body><div></div></body></html>        
    `,
`<!DOCTYPE HTML>
<html>
    <head>
        <title></title>
    </head>
    <body>
        <div></div>
    </body>
</html>`,
HtmlFormatterMode.PRETTY);

test('[unit] HtmlFormatter MINIMIZED mode trims trailing space', testFormat,
`   
<!DOCTYPE HTML>
<html>
    <head>
        <title></title>
    </head>
    <body>
        <div></div>
    </body>
</html>  
    `,
'<!DOCTYPE HTML><html><head><title></title></head><body><div></div></body></html>',
HtmlFormatterMode.MINIMIZED);

test('[unit] HtmlFormatter NONE mode does not trim trailing space', testFormat,
`   
<!DOCTYPE HTML>
<html>
<head>
        <title>
        
        </title></head>
    <body><div>
</div>
    </body>
</html>
   `,
`   
<!DOCTYPE HTML>
<html>
<head>
        <title>
        
        </title></head>
    <body><div>
</div>
    </body>
</html>
   `,
HtmlFormatterMode.NONE);
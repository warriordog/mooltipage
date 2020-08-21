import test, {
    ExecutionContext
} from 'ava';
import { DomParser } from '../../lib/dom/domParser';
import {
    FormatterOptions,
    MinimizedFormatterPreset,
    NoneFormatterPreset,
    PrettyFormatterPreset,
    StandardHtmlFormatter
} from '../../lib/pipeline/module/standardHtmlFormatter';

function testFormat(t: ExecutionContext, input: string, expected: string, options?: FormatterOptions): void {
    const parser = new DomParser({
        recognizeCDATA: true
    });

    const dom = parser.parseDom(input);

    const formatter = new StandardHtmlFormatter(options);
    formatter.formatDom(dom);

    const output1 = dom.toHtml();
    const output2 = formatter.formatHtml(output1);

    t.is(output2, expected);
}

test('HtmlFormatter PRETTY mode cleans whitespace', testFormat,
`
<!DOCTYPE HTML>
<html lang="en">
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
<html lang="en">
    <head>
        <title></title>
    </head>
    <body>
        <div></div>
    </body>
</html>`,
PrettyFormatterPreset);

test('HtmlFormatter PRETTY mode breaks up appended elements', testFormat,
`<!DOCTYPE HTML><html lang="en"><head><title></title></head><body><div></div></body></html>`,
`<!DOCTYPE HTML>
<html lang="en">
    <head>
        <title></title>
    </head>
    <body>
        <div></div>
    </body>
</html>`,
PrettyFormatterPreset);

test('HtmlFormatter PRETTY mode inlines single-line text', testFormat,
`<!DOCTYPE HTML><html lang="en"><head><title>
There is only one line of text, so this should be inlined.

</title></head><body><div></div></body></html>`,
`<!DOCTYPE HTML>
<html lang="en">
    <head>
        <title>There is only one line of text, so this should be inlined.</title>
    </head>
    <body>
        <div></div>
    </body>
</html>`,
PrettyFormatterPreset);


test('HtmlFormatter PRETTY mode does not inline multi-line text', testFormat,
`<!DOCTYPE HTML><html lang="en"><head><title></title></head><body><div>
     There are multiple lines of text here, 
     so this should not be inlined.
</div></body></html>`,
`<!DOCTYPE HTML>
<html lang="en">
    <head>
        <title></title>
    </head>
    <body>
        <div>
            There are multiple lines of text here, so this should not be inlined.
        </div>
    </body>
</html>`,
PrettyFormatterPreset);

test('HtmlFormatter MINIMIZED mode compacts whitespace', testFormat,
`<!DOCTYPE HTML>
<html lang="en">
    <head>
        <title></title>
    </head>
    <body>
        <div></div>
    </body>
</html>`,
'<!DOCTYPE HTML><html lang="en"><head><title></title></head><body><div></div></body></html>',
MinimizedFormatterPreset);

test('HtmlFormatter NONE mode does not change HTML', testFormat,
`<!DOCTYPE HTML>
<html lang="en">
<head>
        <title>
        
        </title></head>
    <body><div>
</div>
    </body>
</html>`,
`<!DOCTYPE HTML>
<html lang="en">
<head>
        <title>
        
        </title></head>
    <body><div>
</div>
    </body>
</html>`);

test('HtmlFormatter PRETTY mode trims trailing space', testFormat,
`   
<!DOCTYPE HTML><html lang="en"><head><title></title></head><body><div></div></body></html>        
    `,
`<!DOCTYPE HTML>
<html lang="en">
    <head>
        <title></title>
    </head>
    <body>
        <div></div>
    </body>
</html>`,
PrettyFormatterPreset);

test('HtmlFormatter MINIMIZED mode trims trailing space', testFormat,
`   
<!DOCTYPE HTML>
<html lang="en">
    <head>
        <title></title>
    </head>
    <body>
        <div></div>
    </body>
</html>  
    `,
'<!DOCTYPE HTML><html lang="en"><head><title></title></head><body><div></div></body></html>',
MinimizedFormatterPreset);

test('HtmlFormatter NONE mode does not trim trailing space', testFormat,
`   
<!DOCTYPE HTML>
<html lang="en">
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
<html lang="en">
<head>
        <title>
        
        </title></head>
    <body><div>
</div>
    </body>
</html>
   `);

test('HtmlFormatter removes comments in minimized mode', testFormat,
    `<!-- Comment 1 --><div><!-- Comment 2 --><div></div></div><!-- 3 --><!-- 4 -->`,
    `<div><div></div></div>`,
    MinimizedFormatterPreset);

test('HtmlFormatter ignores comments in pretty mode', testFormat,
    `<!-- Comment 1 --><div><!-- Comment 2 --><div></div></div><!-- 3 --><!-- 4 -->`,
`<!-- Comment 1 -->
<div>
    <!-- Comment 2 -->
    <div></div>
</div>
<!-- 3 -->
<!-- 4 -->`,
    PrettyFormatterPreset);
test('HtmlFormatter ignores comments in none mode', testFormat,
    `<!-- Comment 1 --><div><!-- Comment 2 --><div></div></div><!-- 3 --><!-- 4 -->`,
    `<!-- Comment 1 --><div><!-- Comment 2 --><div></div></div><!-- 3 --><!-- 4 -->`,
    NoneFormatterPreset);

test('HtmlFormatter removes CDATA in minimized mode', testFormat,
    `<![CDATA[ CDATA 1 ]]><div><![CDATA[ CDATA 2 ]]><div></div></div><![CDATA[ CDATA 3 ]]>`,
    `<div><div></div></div>`,
    MinimizedFormatterPreset);
test('HtmlFormatter removes CDATA in pretty mode', testFormat,
    `<![CDATA[ CDATA 1 ]]>
<div>
    <![CDATA[ CDATA 2 ]]>
    <div></div>
</div>
<![CDATA[ CDATA 3 ]]>`,
    `<div>
    <div></div>
</div>`,
    PrettyFormatterPreset);
test('HtmlFormatter ignores CDATA in none mode', testFormat,
    `<![CDATA[ CDATA 1 ]]><div><![CDATA[ CDATA 2 ]]><div></div></div><![CDATA[ CDATA 3 ]]>`,
    `<![CDATA[ CDATA 1 ]]><div><![CDATA[ CDATA 2 ]]><div></div></div><![CDATA[ CDATA 3 ]]>`,
    NoneFormatterPreset);
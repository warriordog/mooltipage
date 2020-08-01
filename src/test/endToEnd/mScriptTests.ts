import test from 'ava';
import { compareFragmentMacro } from '../_util/htmlCompare';
import { MemoryPipelineInterface } from '../_mocks/memoryPipelineInterface';
import { StandardPipeline } from '../../lib/pipeline/standardPipeline';
import { MimeType } from '../../lib';

test('[endToEnd] <m-script> executes scripts in correct scope', compareFragmentMacro,
`<m-script src="script.js" />
<test value="\${ $.test }" />`,
`<test value="good"></test>`,
[[  'script.js',
    `$.test = "good";`
]]);

test('[endToEnd] <m-script> can override existing vars', compareFragmentMacro,
`<m-var test="bad" />
<m-script src="script.js" />
<test value="\${ $.test }" />`,
`<test value="good"></test>`,
[[  'script.js',
    `$.test = "good";`
]]);

test('[endToEnd] <m-script> supports multiple lines', compareFragmentMacro,
`<m-script src="script.js" />
<test value="\${ $.test }" />`,
`<test value="good"></test>`,
[[  'script.js',
    `const foo = [];
    foo.push('g');
    foo.push('o');
    foo.push('o');
    foo.push('d');
    $.test = foo.join('');`
]]);

test('[endToEnd] <m-script> supports embedded functions', compareFragmentMacro,
`<m-script src="script.js" />
<test value="\${ $.test }" />`,
`<test value="good"></test>`,
[[  'script.js',
    `function getGood() {
        return 'good';
    }
    $.test = getGood();`
]]);

test('[endToEnd] <m-script> allows script exceptions to bubble', t => {
    const errorMessage = 'test error';

    const pi = new MemoryPipelineInterface();
    pi.setSourceHtml('page.html', `<!DOCTYPE html><html><head><title>MScript Tests</title></head><body><m-script src="script.js" /></body></html>`);
    pi.setSource('script.js', {
        type: MimeType.JAVASCRIPT,
        content: `throw new Error('${ errorMessage }');`
    });
    const pipeline = new StandardPipeline(pi);

    t.throws(() => pipeline.compilePage('page.html'), {
        message: errorMessage
    });
});

test('[endToEnd] <m-script> scripts can access pipeline APIs', compareFragmentMacro,
`<m-script src="script.js" />
<test value="\${ $.test }" />`,
`<test value="true"></test>`,
[[  'script.js',
    `$.test = $$.pipelineContext.pipeline !== undefined;`
]]);

test.failing('[endToEnd] <m-script> scripts can access NodeJS APIs', compareFragmentMacro,
`<m-script src="script.js" />
<test value="\${ $.test }" />`,
`<test value="true"></test>`,
[[  'script.js',
    `const fs = require('fs');
    $.test = fs !== undefined;`
]]);

test.failing('[endToEnd] <m-script> scripts can access DOM APIs', compareFragmentMacro,
`<m-script src="script.js" />
<test value="\${ $.test }" />`,
`<test value="true"></test>`,
[[  'script.js',
    ``
]]);
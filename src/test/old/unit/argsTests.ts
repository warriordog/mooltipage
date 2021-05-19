import test from 'ava';
import {
    CliArgs,
    CliOption,
    extractOptions,
    parseArgs,
    parseOptions,
    parsePages
} from '../../../bin/args';

// parsePages()
test('parsePages() handles empty input', t => {
    const args: CliArgs = { pages: [] };
    parsePages([], args);
    t.deepEqual(args.pages, []);
});
test('parsePages() handles only pages', t => {
    const args: CliArgs = { pages: [] };
    parsePages([ 'page1.html', 'page2.html' ], args);
    t.deepEqual(args.pages, [ 'page1.html', 'page2.html' ]);
});
test('parsePages() handles only options', t => {
    const args: CliArgs = { pages: [] };
    parsePages([ '--option1', '--option2=foo', '--option3' ], args);
    t.deepEqual(args.pages, []);
});
test('parsePages() picks pages from mixed content', t => {
    const args: CliArgs = { pages: [] };
    parsePages([ '--option1', 'page1.html', '--option2=foo', 'page2.html', '--option3' ], args);
    t.deepEqual(args.pages, [ 'page1.html', 'page2.html' ]);
});

// extractOptions()
test('extractOptions() handles empty input', t => {
    t.deepEqual(extractOptions([]), []);
});
test('extractOptions() handles only pages', t => {
    t.deepEqual(extractOptions([ 'page1.html', 'page2.html' ]), []);
});
test('extractOptions() handles only options', t => {
    t.is(extractOptions([ '--option1', '--option2=foo', '--option3' ]).length, 3);
});
test('extractOptions() picks options from mixed content', t => {
    t.is(extractOptions([ '--option1', 'page1.html', '--option2=foo', 'page2.html', '--option3' ]).length, 3);
});
test('extractOptions() keeps correct label', t => {
    const options = extractOptions([ '--oPtIoN=vaLue' ]);
    t.is(options.length, 1);
    const option = options[0];
    t.is(option.label, '--oPtIoN');
});
test('extractOptions() computes correct name', t => {
    const options = extractOptions([ '--oPtIoN=vaLue' ]);
    t.is(options.length, 1);
    const option = options[0];
    t.is(option.name, 'option');
});
test('extractOptions() extracts value', t => {
    const options = extractOptions([ '--oPtIoN=vaLue' ]);
    t.is(options.length, 1);
    const option = options[0];
    t.is(option.value, 'vaLue');
});
test('extractOptions() handles empty value', t => {
    const options = extractOptions([ '--oPtIoN=' ]);
    t.is(options.length, 1);
    const option = options[0];
    t.is(option.value, '');
});
test('extractOptions() handles no', t => {
    const options = extractOptions([ '--oPtIoN' ]);
    t.is(options.length, 1);
    const option = options[0];
    t.is(option.value, undefined);
});
test('extractOptions() correctly parses multiple options', t => {
    const options = extractOptions([ '--option1=value1', '--OPTION2', '--Option3=' ]);
    const expected: CliOption[] = [
        { label: '--option1', name: 'option1', value: 'value1' },
        { label: '--OPTION2', name: 'option2', value: undefined },
        { label: '--Option3', name: 'option3', value: '' }
    ];
    t.deepEqual(options, expected);
});

// parseOptions()
test('parseOptions() handles --help', t => {
    const args: CliArgs = { pages: [] };
    parseOptions([ '--help' ], args);
    t.true(args.isHelp);
});
test('parseOptions() handles --help with capitalization', t => {
    const args: CliArgs = { pages: [] };
    parseOptions([ '--HeLp' ], args);
    t.true(args.isHelp);
});
test('parseOptions() handles --inpath', t => {
    const args: CliArgs = { pages: [] };
    parseOptions([ '--inpath=source/path' ], args);
    t.is(args.inPath, 'source/path');
});
test('parseOptions() handles --inpath with capitalization', t => {
    const args: CliArgs = { pages: [] };
    parseOptions([ '--InPath=source/path' ], args);
    t.is(args.inPath, 'source/path');
});
test('parseOptions() requires value for --inpath', t => {
    const args: CliArgs = { pages: [] };
    t.throws(() => parseOptions([ '--inpath' ], args));
});
test('parseOptions() handles --outpath', t => {
    const args: CliArgs = { pages: [] };
    parseOptions([ '--outpath=destination/path' ], args);
    t.is(args.outPath, 'destination/path');
});
test('parseOptions() handles --outpath with capitalization', t => {
    const args: CliArgs = { pages: [] };
    parseOptions([ '--OutPath=destination/path' ], args);
    t.is(args.outPath, 'destination/path');
});
test('parseOptions() requires value for --outpath', t => {
    const args: CliArgs = { pages: [] };
    t.throws(() => parseOptions([ '--outpath' ], args));
});
test('parseOptions() handles --formatter', t => {
    const args: CliArgs = { pages: [] };
    parseOptions([ '--formatter=formatterName' ], args);
    t.is(args.formatter, 'formatterName');
});
test('parseOptions() handles --formatter with capitalization', t => {
    const args: CliArgs = { pages: [] };
    parseOptions([ '--Formatter=formatterName' ], args);
    t.is(args.formatter, 'formatterName');
});
test('parseOptions() requires value for --formatter', t => {
    const args: CliArgs = { pages: [] };
    t.throws(() => parseOptions([ '--formatter' ], args));
});
test('parseOptions() handles all args', t => {
    const args: CliArgs = { pages: [] };
    parseOptions([ '--inpath=in/path', '--outpath=out/path', '--formatter=formatterName' ], args);
    t.is(args.inPath, 'in/path');
    t.is(args.outPath, 'out/path');
    t.is(args.formatter, 'formatterName');
});
test('parseOptions() throws on unknown argument', t => {
    const args: CliArgs = { pages: [] };
    t.throws(() => parseOptions([ '--badArg' ], args));
});

// parseArgs()
test('parseArgs() sets help flag with no args', t => {
    const args = parseArgs([]);
    t.true(args.isHelp);
});
test('parseArgs() sets help flag if provided', t => {
    const args = parseArgs([ '--help', '--inpath=in/path', 'page.html' ]);
    t.true(args.isHelp);
});
test('parseArgs() collects page arguments', t => {
    const args = parseArgs([ 'page.html', 'another/page.html', 'a/folder' ]);
    t.deepEqual(args.pages, [ 'page.html', 'another/page.html', 'a/folder' ]);
});
test('parseArgs() parses option arguments', t => {
    const args = parseArgs([ '--inpath=in/path', '--outpath=out/path', '--formatter=format' ]);
    t.is(args.inPath, 'in/path');
    t.is(args.outPath, 'out/path');
    t.is(args.formatter, 'format');
    t.falsy(args.isHelp);
});
test('parseArgs() handles mixed arguments', t => {
    const args = parseArgs([ '--inpath=in/path', 'page.html', '--outpath=out/path', 'a/folder', '--formatter=format' ]);
    t.is(args.inPath, 'in/path');
    t.is(args.outPath, 'out/path');
    t.is(args.formatter, 'format');
    t.deepEqual(args.pages, [ 'page.html', 'a/folder' ]);
    t.falsy(args.isHelp);
});
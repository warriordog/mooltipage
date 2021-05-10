import test
    from 'ava';
import {
    DefaultMpOptions,
    Mooltipage,
    MpOptions,
    getResourceTypeExtension,
    MimeType
} from '../../lib';
import {
    StandardHtmlFormatter,
    FormatterMode,
    PrettyFormatterPreset,
    MinimizedFormatterPreset,
    NoneFormatterPreset,
    createStandardHtmlFormatter
} from '../../lib/pipeline/module/standardHtmlFormatter';
import {
    getTestDataPath,
    useSandboxDirectory
} from '../_util/testFsUtils';
import fs from 'fs';
import {join} from 'path';
import {PipelineIOImpl} from '../../lib/pipeline/standardPipeline';

// createStandardHtmlFormatter()
test('createStandardHtmlFormatter() creates pretty formatter', t => {
    const formatter = createStandardHtmlFormatter(FormatterMode.PRETTY);
    t.true(formatter instanceof StandardHtmlFormatter);
    t.deepEqual((formatter as StandardHtmlFormatter).options, PrettyFormatterPreset);
});
test('createStandardHtmlFormatter() creates ugly formatter', t => {
    const formatter = createStandardHtmlFormatter(FormatterMode.MINIMIZED);
    t.true(formatter instanceof StandardHtmlFormatter);
    t.deepEqual((formatter as StandardHtmlFormatter).options, MinimizedFormatterPreset);
});
test('createStandardHtmlFormatter() creates none formatter', t => {
    const formatter = createStandardHtmlFormatter(FormatterMode.NONE);
    t.true(formatter instanceof StandardHtmlFormatter);
    t.deepEqual((formatter as StandardHtmlFormatter).options, NoneFormatterPreset);
});
test('createStandardHtmlFormatter() defaults to none formatter', t => {
    const formatter = createStandardHtmlFormatter();
    t.true(formatter instanceof StandardHtmlFormatter);
    t.deepEqual((formatter as StandardHtmlFormatter).options, NoneFormatterPreset);
});
test('createStandardHtmlFormatter() throws on invalid formatter', t => {
    t.throws(() => createStandardHtmlFormatter('invalid'));
});

// DefaultMpOptions
test('DefaultMpOptions sets formatter', t => {
    t.is(new DefaultMpOptions().formatter, FormatterMode.PRETTY);
});
// PipelineIOImpl
test('PipelineIOImpl.resolveSourceResource() resolves relative to source path', t => {
    const pi = new PipelineIOImpl(getTestDataPath('testFolder'), process.cwd());
    t.is(pi.resolveSourceResource('testPage.html'), getTestDataPath('testFolder/testPage.html'));
});
test('PipelineIOImpl.resolveDestinationResource() resolves relative to destination path', async t => {
    await useSandboxDirectory(async (sandboxPath) => {
        const pi = new PipelineIOImpl(getTestDataPath('testFolder'), join(sandboxPath, 'outFolder'));
        t.is(pi.resolveDestinationResource('testPage.html'), join(sandboxPath, 'outFolder/testPage.html'));
    });
});
test('PipelineIOImpl.createResPath() generates unique resource paths', t => {
    const pi = new PipelineIOImpl(process.cwd(), process.cwd());
    const paths = new Set<string>();
    paths.add(pi.createResPath(MimeType.TEXT, 'test'));
    paths.add(pi.createResPath(MimeType.TEXT, 'test'));
    paths.add(pi.createResPath(MimeType.CSS, 'test'));
    paths.add(pi.createResPath(MimeType.CSS, 'test'));
    paths.add(pi.createResPath(MimeType.JAVASCRIPT, 'test'));
    paths.add(pi.createResPath(MimeType.JAVASCRIPT, 'test'));
    t.is(paths.size, 3);
});
test('PipelineIOImpl.createResPath() attaches correct file extension', t => {
    const pi = new PipelineIOImpl(process.cwd(), process.cwd());
    for (const mime of [MimeType.HTML, MimeType.CSS, MimeType.JAVASCRIPT, MimeType.JSON, MimeType.TEXT, 'unknown' as MimeType]) {
        t.true(pi.createResPath(mime, 'test').endsWith(getResourceTypeExtension(mime)));
    }
});
test('PipelineIOImpl.getResource() reads relative to source path', async t => {
    const pi = new PipelineIOImpl(getTestDataPath('testFolder'), process.cwd());
    const css = await pi.getResource(MimeType.CSS, 'styleContent.css');
    t.is(css, '.class { }');
    const text = await pi.getResource(MimeType.TEXT, 'textContent.txt');
    t.is(text, 'This is text');
});
test('PipelineIOImpl.writeResource() writes relative to destination path', async t => {
    await useSandboxDirectory(async (sandboxPath) => {
        fs.mkdirSync(join(sandboxPath, 'outFolder'));
        const pi = new PipelineIOImpl(getTestDataPath('testFolder/subFolder'), join(sandboxPath, 'outFolder'));
        await pi.writeResource(MimeType.TEXT, 'test.txt', 'This is a test file.');
        t.true(fs.existsSync(join(sandboxPath, 'outFolder/test.txt')));
    });
});
test('PipelineIOImpl.createResource() writes relative to destination path', async t => {
    await useSandboxDirectory(async (sandboxPath) => {
        const outFolderPath = join(sandboxPath, 'outFolder');
        fs.mkdirSync(outFolderPath);
        const pi = new PipelineIOImpl(getTestDataPath('testFolder/subFolder'), outFolderPath);
        const createdPath = await pi.createResource(MimeType.TEXT, 'This is a test file.');
        t.true(fs.existsSync(join(outFolderPath, createdPath)));
    });
});
test('PipelineIOImpl.createResource() applies correct file extension', async t => {
    await useSandboxDirectory(async(sandboxPath) => {
        const pi = new PipelineIOImpl(getTestDataPath('testFolder/subFolder'), join(sandboxPath, 'outFolder'));
        for (const mime of [MimeType.HTML, MimeType.CSS, MimeType.JAVASCRIPT, MimeType.JSON, MimeType.TEXT, 'unknown' as MimeType]) {
            t.true((await pi.createResource(mime, 'content')).endsWith(getResourceTypeExtension(mime)));
        }
    });
});

// Mooltipage
test('Mooltipage constructor accepts options', t => {
    const options: MpOptions = {
        inPath: 'in',
        outPath: 'out'
    };
    t.is(new Mooltipage(options).options, options);
});
test('Mooltipage constructor applies default options', t => {
    t.truthy(new Mooltipage().options);
});
test('Mooltipage constructor creates pipeline', t => {
    t.truthy(new Mooltipage().pipeline);
});
test('Mooltipage.processPage() compiles a page', async t => {
    await useSandboxDirectory(async (sandboxPath) => {
        const mp = new Mooltipage({
            inPath: getTestDataPath('./'),
            outPath: join(sandboxPath, 'out')
        });
        await mp.processPage('testPage.html');
        t.true(fs.existsSync(join(sandboxPath, 'out/testPage.html')));
    });
});
test('Mooltipage.processPages() compiles multiple pages', async t => {
    await useSandboxDirectory(async (sandboxPath) => {
        const mp = new Mooltipage({
            inPath: getTestDataPath('testFolder'),
            outPath: join(sandboxPath, 'out')
        });
        await mp.processPages([ 'subFolder/subPage1.html', 'subFolder/subPage2.html' ]);
        t.true(fs.existsSync(join(sandboxPath, 'out/subFolder/subPage1.html')));
        t.true(fs.existsSync(join(sandboxPath, 'out/subFolder/subPage2.html')));
    });
});
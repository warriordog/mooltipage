import test
    from 'ava';
import {
    createFormatter,
    DefaultMpOptions,
    getResourceTypeExtension,
    Mooltipage,
    MpOptions,
    NodePipelineInterface
} from '../../lib/api/mooltipage';
import {
    StandardHtmlFormatter,
    StandardHtmlFormatterMode
} from '../../lib/pipeline/module/standardHtmlFormatter';
import {
    getSandboxPath,
    getTestDataPath,
    useSandboxDirectory
} from '../_util/testFsUtils';
import {MimeType} from '../../lib';
import fs from 'fs';
import Path from 'path';

// createFormatter()
test('createFormatter() creates pretty formatter', t => {
    const formatter = createFormatter({ formatter: StandardHtmlFormatterMode.PRETTY });
    t.true(formatter instanceof StandardHtmlFormatter);
    t.is((formatter as StandardHtmlFormatter).formatMode, StandardHtmlFormatterMode.PRETTY)
});
test('createFormatter() creates ugly formatter', t => {
    const formatter = createFormatter({ formatter: StandardHtmlFormatterMode.MINIMIZED });
    t.true(formatter instanceof StandardHtmlFormatter);
    t.is((formatter as StandardHtmlFormatter).formatMode, StandardHtmlFormatterMode.MINIMIZED)
});
test('createFormatter() creates none formatter', t => {
    const formatter = createFormatter({ formatter: StandardHtmlFormatterMode.NONE });
    t.true(formatter instanceof StandardHtmlFormatter);
    t.is((formatter as StandardHtmlFormatter).formatMode, StandardHtmlFormatterMode.NONE)
});
test('createFormatter() defaults to none formatter', t => {
    const formatter = createFormatter({ formatter: undefined });
    t.true(formatter instanceof StandardHtmlFormatter);
    t.is((formatter as StandardHtmlFormatter).formatMode, StandardHtmlFormatterMode.NONE)
});
test('createFormatter() throws on invalid formatter', t => {
    t.throws(() => createFormatter({ formatter: 'invalid' }));
});

// DefaultMpOptions
test('DefaultMpOptions sets formatter', t => {
    t.is(new DefaultMpOptions().formatter, StandardHtmlFormatterMode.PRETTY);
});
// NodePipelineInterface
test('NodePipelineInterface.resolveSourceResource() resolves relative to source path', t => {
    const pi = new NodePipelineInterface(getTestDataPath('testFolder'));
    t.is(pi.resolveSourceResource('testPage.html'), getTestDataPath('testFolder/testPage.html'));
});
test('NodePipelineInterface.resolveDestinationResource() resolves relative to destination path', t => {
    const pi = new NodePipelineInterface(getTestDataPath('testFolder'), getSandboxPath('outFolder'));
    t.is(pi.resolveDestinationResource('testPage.html'), getSandboxPath('outFolder/testPage.html'));
});
test('NodePipelineInterface.createResPath() generates unique resource paths', t => {
    const pi = new NodePipelineInterface();
    const paths = new Set<string>();
    paths.add(pi.createResPath(MimeType.TEXT));
    paths.add(pi.createResPath(MimeType.TEXT));
    paths.add(pi.createResPath(MimeType.CSS));
    paths.add(pi.createResPath(MimeType.CSS));
    paths.add(pi.createResPath(MimeType.JAVASCRIPT));
    paths.add(pi.createResPath(MimeType.JAVASCRIPT));
    t.is(paths.size, 6);
});
test('NodePipelineInterface.createResPath() attaches correct file extension', t => {
    const pi = new NodePipelineInterface();
    for (const mime of [MimeType.HTML, MimeType.CSS, MimeType.JAVASCRIPT, MimeType.JSON, MimeType.TEXT, 'unknown' as MimeType]) {
        t.true(pi.createResPath(mime).endsWith(getResourceTypeExtension(mime)))
    }
});
test('NodePipelineInterface.getResource() reads relative to source path', t => {
    const pi = new NodePipelineInterface(getTestDataPath('testFolder'));
    const css = pi.getResource(MimeType.CSS, 'styleContent.css');
    t.is(css, '.class { }');
    const text = pi.getResource(MimeType.TEXT, 'textContent.txt');
    t.is(text, 'This is text');
});
test.serial('NodePipelineInterface.writeResource() writes relative to destination path', t => {
    useSandboxDirectory(() => {
        fs.mkdirSync(getSandboxPath('outFolder'));
        const pi = new NodePipelineInterface(getTestDataPath('testFolder/subFolder'), getSandboxPath('outFolder'));
        pi.writeResource(MimeType.TEXT, 'test.txt', 'This is a test file.');
        t.true(fs.existsSync(getSandboxPath('outFolder/test.txt')));
    });
});
test.serial('NodePipelineInterface.createResource() writes relative to destination path', t => {
    useSandboxDirectory(() => {
        const outFolderPath = getSandboxPath('outFolder');
        fs.mkdirSync(outFolderPath);
        const pi = new NodePipelineInterface(getTestDataPath('testFolder/subFolder'), outFolderPath);
        const createdPath = pi.createResource(MimeType.TEXT, 'This is a test file.');
        t.true(fs.existsSync(Path.join(outFolderPath, createdPath)));
    });
});
test.serial('NodePipelineInterface.createResource() applies correct file extension', t => {
    useSandboxDirectory(() => {
        const pi = new NodePipelineInterface(getTestDataPath('testFolder/subFolder'), getSandboxPath('outFolder'));
        for (const mime of [MimeType.HTML, MimeType.CSS, MimeType.JAVASCRIPT, MimeType.JSON, MimeType.TEXT, 'unknown' as MimeType]) {
            t.true(pi.createResource(mime, 'content').endsWith(getResourceTypeExtension(mime)));
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
test.serial('Mooltipage.processPage() compiles a page', t => {
    useSandboxDirectory(() => {
        const mp = new Mooltipage({
            inPath: getTestDataPath('./'),
            outPath: getSandboxPath('out')
        });
        mp.processPage('testPage.html');
        t.true(fs.existsSync(getSandboxPath('out/testPage.html')));
    });
});
test.serial('Mooltipage.processPages() compiles multiple pages', t => {
    useSandboxDirectory(() => {
        const mp = new Mooltipage({
            inPath: getTestDataPath('testFolder'),
            outPath: getSandboxPath('out')
        });
        mp.processPages([ 'subFolder/subPage1.html', 'subFolder/subPage2.html' ]);
        t.true(fs.existsSync(getSandboxPath('out/subFolder/subPage1.html')));
        t.true(fs.existsSync(getSandboxPath('out/subFolder/subPage2.html')));
    });
});
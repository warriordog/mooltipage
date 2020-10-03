import test from 'ava';
import fs from 'fs';
import {
    expandPagePaths,
    getDirectoryContents,
    pathIsDirectory,
    pathIsFile,
    readFile,
    writeFile
} from '../../lib/fs/fsUtils';
import {
    fixSep,
    getSandboxPath,
    getTestDataPath,
    useSandboxDirectory
} from '../_util/testFsUtils';

test('pathIsFile() identifies files', t => {
    t.true(pathIsFile(getTestDataPath('testPage.html')));
});
test('pathIsFile() identifies non-files', t => {
    t.false(pathIsFile(getTestDataPath('testFolder')));
});
test('pathIsFile() handles incorrect path', t => {
    t.false(pathIsFile(getTestDataPath('bad.path')));
});

test('pathIsDirectory() identifies directories', t => {
    t.false(pathIsDirectory(getTestDataPath('testPage.html')));
});
test('pathIsDirectory() identifies non-directories', t => {
    t.true(pathIsDirectory(getTestDataPath('testFolder')));
});
test('pathIsDirectory() handles incorrect path', t => {
    t.false(pathIsDirectory(getTestDataPath('bad.path')));
});

test('getDirectoryContents() gets directory contents', t => {
    const contents = getDirectoryContents(getTestDataPath('testFolder'));
    t.is(contents.length, 3);
    t.true(contents.includes('subFolder'));
    t.true(contents.includes('styleContent.css'));
    t.true(contents.includes('textContent.txt'));
});
test('getDirectoryContents() handles empty directories', t => {
    useSandboxDirectory(() => {
        const emptyPath = getSandboxPath('emptyFolder');
        fs.mkdirSync(emptyPath);
        const contents = getDirectoryContents(emptyPath);
        t.is(contents.length, 0);
    });
});
test('getDirectoryContents() throws on non-directory arguments', t => {
    t.throws(() => getDirectoryContents(getTestDataPath('testPage.html')));
});
test('getDirectoryContents() throws on incorrect path', t => {
    t.throws(() => getDirectoryContents(getTestDataPath('bad.path')));
});

test('expandPagePaths() finds all pages and ignores non-HTML', t => {
    const paths = [ getTestDataPath('testFolder/subFolder')];
    const pages = expandPagePaths(paths, getTestDataPath('testFolder'));
    t.deepEqual(pages, [ fixSep('subFolder/subPage1.html'), fixSep('subFolder/subPage2.html')]);
});

test('readFile() reads file contents', t => {
    t.is(readFile(getTestDataPath('testFolder/textContent.txt')), 'This is text');
});
test('readFile() throws on non-file path', t => {
    t.throws(() => readFile(getTestDataPath('testFolder')));
});
test('readFile() throws on incorrect path', t => {
    t.throws(() => readFile(getTestDataPath('bad.path')));
});

test.serial('writeFile() writes file', t => {
    useSandboxDirectory(() => {
        const path = getSandboxPath('testWrite.txt');

        writeFile(path, 'test content');

        t.true(fs.existsSync(path));
        t.is(fs.readFileSync(path, 'utf-8'), 'test content');
    });
});
test.serial('writeFile() creates directory structure', t => {
    useSandboxDirectory(() => {
        const path = getSandboxPath('testWriteDir/testWrite2/testWrite.txt');

        writeFile(path, 'test content', true);

        t.true(fs.existsSync(getSandboxPath('testWriteDir')));
        t.true(fs.statSync(getSandboxPath('testWriteDir')).isDirectory());
        t.true(fs.existsSync(getSandboxPath('testWriteDir/testWrite2')));
        t.true(fs.statSync(getSandboxPath('testWriteDir/testWrite2')).isDirectory());

        t.true(fs.existsSync(path));
        t.true(fs.statSync(path).isFile());
        t.is(fs.readFileSync(path, 'utf-8'), 'test content');
    });
});
import test from 'ava';
import Path from 'path';
import {
    expandPagePaths,
    getDirectoryContents,
    pathIsDirectory,
    pathIsFile,
    readFile
} from '../../lib/fs/fsUtils';

function fixSep(path: string): string {
    return path.replace('/', Path.sep);
}

function getTestDataPath(offsetPath: string): string {
    // tests run from compiled root /dist, but the test data is not compiled and exists in /src
    return Path.resolve(__dirname, fixSep('../../../src/test/_data'), fixSep(offsetPath));
}

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
    const contents = getDirectoryContents(getTestDataPath('emptyFolder'));
    t.is(contents.length, 0);
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
test('readFile() throws on incorrect path',t  => {
    t.throws(() => readFile(getTestDataPath('bad.path')));
});
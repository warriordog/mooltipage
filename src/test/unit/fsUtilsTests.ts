import test from 'ava';
import fs from 'fs';
import {
    getDirectoryContents,
    pathIsDirectory,
    pathIsFile,
    readFile,
    writeFile
} from '../../lib/fs/fsUtils';
import {
    getTestDataPath,
    useSandboxDirectory
} from '../_util/testFsUtils';
import {join} from 'path';

test('pathIsFile() identifies files', async t => {
    t.true(await pathIsFile(getTestDataPath('testPage.html')));
});
test('pathIsFile() identifies non-files', async t => {
    t.false(await pathIsFile(getTestDataPath('testFolder')));
});
test('pathIsFile() handles incorrect path', async t => {
    t.false(await pathIsFile(getTestDataPath('bad.path')));
});

test('pathIsDirectory() identifies directories', async t => {
    t.false(await pathIsDirectory(getTestDataPath('testPage.html')));
});
test('pathIsDirectory() identifies non-directories', async t => {
    t.true(await pathIsDirectory(getTestDataPath('testFolder')));
});
test('pathIsDirectory() handles incorrect path', async t => {
    t.false(await pathIsDirectory(getTestDataPath('bad.path')));
});

test('getDirectoryContents() gets directory contents', async t => {
    const contents = await getDirectoryContents(getTestDataPath('testFolder'));
    t.is(contents.length, 3);
    t.true(contents.includes('subFolder'));
    t.true(contents.includes('styleContent.css'));
    t.true(contents.includes('textContent.txt'));
});
test('getDirectoryContents() handles empty directories', async t => {
    await useSandboxDirectory(async (sandboxPath) => {
        const emptyPath = join(sandboxPath, 'emptyFolder');
        fs.mkdirSync(emptyPath);
        const contents = await getDirectoryContents(emptyPath);
        t.is(contents.length, 0);
    });
});
test('getDirectoryContents() throws on non-directory arguments', async t => {
    await t.throwsAsync(async () => await getDirectoryContents(getTestDataPath('testPage.html')));
});
test('getDirectoryContents() throws on incorrect path', async t => {
    await t.throwsAsync(async () => await getDirectoryContents(getTestDataPath('bad.path')));
});

test('readFile() reads file contents', async t => {
    t.is(await readFile(getTestDataPath('testFolder/textContent.txt')), 'This is text');
});
test('readFile() throws on non-file path', async t => {
    await t.throwsAsync(async () => await readFile(getTestDataPath('testFolder')));
});
test('readFile() throws on incorrect path', async t => {
    await t.throwsAsync(async () => await readFile(getTestDataPath('bad.path')));
});

test('writeFile() writes file', async t => {
    await useSandboxDirectory(async (sandboxPath) => {
        const path = join(sandboxPath, 'testWrite.txt');

        await writeFile(path, 'test content');

        t.true(fs.existsSync(path));
        t.is(fs.readFileSync(path, 'utf-8'), 'test content');
    });
});
test('writeFile() creates directory structure', async t => {
    await useSandboxDirectory(async (sandboxPath) => {
        const path = join(sandboxPath, 'testWriteDir/testWrite2/testWrite.txt');

        await writeFile(path, 'test content', true);

        t.true(fs.existsSync(join(sandboxPath, 'testWriteDir')));
        t.true(fs.statSync(join(sandboxPath, 'testWriteDir')).isDirectory());
        t.true(fs.existsSync(join(sandboxPath, 'testWriteDir/testWrite2')));
        t.true(fs.statSync(join(sandboxPath, 'testWriteDir/testWrite2')).isDirectory());

        t.true(fs.existsSync(path));
        t.true(fs.statSync(path).isFile());
        t.is(fs.readFileSync(path, 'utf-8'), 'test content');
    });
});
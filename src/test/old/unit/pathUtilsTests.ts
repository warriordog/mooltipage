import test from 'ava';
import {
    computeRelativeResPath,
    fixPathSeparators,
    resolveResPath
} from '../../../lib/fs/pathUtils';

test('resolveResPath() ignores absolute paths', t => {
    t.is(resolveResPath(fixPathSeparators('/some/path'), ''), fixPathSeparators('/some/path'));
});

test('resolveResPath() normalizes path', t => {
    t.is(resolveResPath(fixPathSeparators('./some/path'), ''), fixPathSeparators('some/path'));
    t.is(resolveResPath(fixPathSeparators('some/path/../'), ''), fixPathSeparators('some/'));
    t.is(resolveResPath(fixPathSeparators('./some/./path/./'), ''), fixPathSeparators('some/path/'));
});

test('resolveResPath() with base path makes relative', t => {
    t.is(resolveResPath(fixPathSeparators('some/path'), fixPathSeparators('./another/path/')), fixPathSeparators('another/path/some/path'));
});

test('resolveResPath() takes directory name of base path', t => {
    t.is(resolveResPath(fixPathSeparators('child.html'), fixPathSeparators('./fragments/frag.html')), fixPathSeparators('fragments/child.html'));
});

test('resolveResPath() treats "@" paths as relative to root', t => {
    t.is(resolveResPath(fixPathSeparators('@/some/path'), ''), fixPathSeparators('some/path'));
    t.is(resolveResPath(fixPathSeparators('@/some/path'), fixPathSeparators('base/path')), fixPathSeparators('some/path'));
});

test('computeRelativeResPath() computes relative path', t => {
    const sourcePath = fixPathSeparators('section1/page.html');
    const targetPath = fixPathSeparators('section2/subsection/page2.html');
    t.is(computeRelativeResPath(sourcePath, targetPath), fixPathSeparators('../section2/subsection/page2.html'));
});

test('resolveResPath handles forward slashes', t => {
    t.is(resolveResPath('./subFolder/target.html', './folder/source.html'), fixPathSeparators('folder/subFolder/target.html'));
});
test('resolveResPath handles back slashes', t => {
    t.is(resolveResPath('.\\subFolder\\target.html', '.\\folder\\source.html'), fixPathSeparators('folder/subFolder/target.html'));
});
test('computeRelativeResPath handles forward slashes', t => {
    t.is(computeRelativeResPath('folder1/page.html', 'folder2/page2.html'), fixPathSeparators('../folder2/page2.html'));
});
test('computeRelativeResPath handles back slashes', t => {
    t.is(computeRelativeResPath('folder1\\page.html', 'folder2\\page2.html'), fixPathSeparators('../folder2/page2.html'));
});
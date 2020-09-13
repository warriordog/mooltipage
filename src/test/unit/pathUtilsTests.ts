import test from 'ava';
import {
    computePathBetween,
    resolveResPath
} from '../../lib/fs/pathUtils';
import {fixSep} from '../_util/testFsUtils';

test('resolveResPath() ignores absolute paths', t => {
    t.is(resolveResPath(fixSep('/some/path')), fixSep('/some/path'));
});

test('resolveResPath() without base path adds ./', t => {
    t.is(resolveResPath(fixSep('some/path')), fixSep('./some/path'));
});

test('resolveResPath() does not add extra ./', t => {
    t.is(resolveResPath(fixSep('./some/path')), fixSep('./some/path'));
});

test('resolveResPath() with base path makes relative', t => {
    t.is(resolveResPath(fixSep('some/path'), fixSep('./another/path/')), fixSep('./another/path/some/path'));
});

test('resolveResPath() take directory name of base path', t => {
    t.is(resolveResPath(fixSep('child.html'), fixSep('./fragments/frag.html')), fixSep('./fragments/child.html'));
});

test('resolvePath() treats "@" paths as relative to root', t => {
    t.is(resolveResPath(fixSep('@/some/path')), fixSep('./some/path'));
    t.is(resolveResPath(fixSep('@/some/path'), fixSep('base/path')), fixSep('./some/path'));
});

test('computePathBetween() computes relative path', t => {
    // some/base/path/the/source/path

    // some/base/path/./the/../target/path
    // some/base/path/target/path
    
    // ../../target/path
    t.is(computePathBetween(fixSep('some/base/path'), fixSep('./the/../target/path'), fixSep('the/source/path')), fixSep('../../target/path'));
});
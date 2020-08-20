import test from 'ava';
import {resolveResPath} from '../../lib/pipeline/module/resolvePath';

test('resolveResPath() ignores absolute paths', t => {
    t.is(resolveResPath('/some/path'), '/some/path');
});

test('resolveResPath() without base path adds ./', t => {
    t.is(resolveResPath('some/path'), './some/path');
});

test('resolveResPath() does not add extra ./', t => {
    t.is(resolveResPath('./some/path'), './some/path');
});

test('resolveResPath() with base path makes relative', t => {
    t.is(resolveResPath('some/path', './another/path/'), './another/path/some/path');
});

test('resolveResPath() take directory name of base path', t => {
    t.is(resolveResPath('child.html', './fragments/frag.html'), './fragments/child.html');
});

test('resolvePath() treats "@" paths as relative to root', t => {
    t.is(resolveResPath('@/some/path'), './some/path');
    t.is(resolveResPath('@/some/path', 'base/path'), './some/path');
});
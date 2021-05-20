import test from 'ava';
import {
    computeRelativeResPath,
    fixPathSeparators
} from '../../lib/fs/pathUtils';

test('computeRelativeResPath handles target in same folder', t => {
    // Source as file
    const t1 = computeRelativeResPath('1.html', '2.html');
    t.is(t1, fixPathSeparators('2.html'));
    const t2 = computeRelativeResPath('parent/1.html', 'parent/2.html');
    t.is(t2, fixPathSeparators('2.html'));
    const t3 = computeRelativeResPath('root/parent/1.html', 'root/parent/2.html');
    t.is(t3, fixPathSeparators('2.html'));

    // Source as directory
    const t4 = computeRelativeResPath('', '2.html');
    t.is(t4, fixPathSeparators('2.html'));
    const t5 = computeRelativeResPath('parent/', 'parent/2.html');
    t.is(t5, fixPathSeparators('2.html'));
    const t6 = computeRelativeResPath('root/parent/', 'root/parent/2.html');
    t.is(t6, fixPathSeparators('2.html'));
});

test('computeRelativeResPath handles target in child', t => {
    // Source as file
    const t1 = computeRelativeResPath('1.html', 'child/2.html');
    t.is(t1, fixPathSeparators('child/2.html'));
    const t2 = computeRelativeResPath('parent/1.html', 'parent/child/2.html');
    t.is(t2, fixPathSeparators('child/2.html'));
    const t3 = computeRelativeResPath('root/parent/1.html', 'root/parent/child/2.html');
    t.is(t3, fixPathSeparators('child/2.html'));

    // Source as directory
    const t4 = computeRelativeResPath('', 'child/2.html');
    t.is(t4, fixPathSeparators('child/2.html'));
    const t5 = computeRelativeResPath('parent/', 'parent/child/2.html');
    t.is(t5, fixPathSeparators('child/2.html'));
    const t6 = computeRelativeResPath('root/parent/', 'root/parent/child/2.html');
    t.is(t6, fixPathSeparators('child/2.html'));
});

test('computeRelativeResPath handles target in parent', t => {
    // Source as file
    const t1 = computeRelativeResPath('child/1.html', '2.html');
    t.is(t1, fixPathSeparators('../2.html'));
    const t2 = computeRelativeResPath('parent/child/1.html', 'parent/2.html');
    t.is(t2, fixPathSeparators('../2.html'));
    const t3 = computeRelativeResPath('root/parent/child/1.html', 'root/parent/2.html');
    t.is(t3, fixPathSeparators('../2.html'));

    // Source as directory
    const t4 = computeRelativeResPath('child/', '2.html');
    t.is(t4, fixPathSeparators('../2.html'));
    const t5 = computeRelativeResPath('parent/child/', 'parent/2.html');
    t.is(t5, fixPathSeparators('../2.html'));
    const t6 = computeRelativeResPath('root/parent/child/', 'root/parent/2.html');
    t.is(t6, fixPathSeparators('../2.html'));
});

test('computeRelativeResPath handles target in different folder', t => {
    // Source as file
    const t1 = computeRelativeResPath('child1/1.html', 'child2/2.html');
    t.is(t1, fixPathSeparators('../child2/2.html'));
    const t2 = computeRelativeResPath('parent/child1/1.html', 'parent/child2/2.html');
    t.is(t2, fixPathSeparators('../child2/2.html'));
    const t3 = computeRelativeResPath('root/parent/child1/1.html', 'root/parent/child2/2.html');
    t.is(t3, fixPathSeparators('../child2/2.html'));

    // Source as directory
    const t4 = computeRelativeResPath('child1/', 'child2/2.html');
    t.is(t4, fixPathSeparators('../child2/2.html'));
    const t5 = computeRelativeResPath('parent/child1/', 'parent/child2/2.html');
    t.is(t5, fixPathSeparators('../child2/2.html'));
    const t6 = computeRelativeResPath('root/parent/child1/', 'root/parent/child2/2.html');
    t.is(t6, fixPathSeparators('../child2/2.html'));
});
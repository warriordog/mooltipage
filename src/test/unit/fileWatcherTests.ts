import test from 'ava';
import {
    getSandboxPath,
    useSandboxDirectory
} from '../_util/testFsUtils';
import {FileWatcher} from '../../bin/fileWatcher';
import * as fs
    from 'fs';

// TODO this entire file is broken, because I forgot that FS watchers are not synchronous. Research is needed to fix these tests

function touchFiles(...paths: string[]): void {
    for (const path of paths) {
        fs.writeFileSync(getSandboxPath(path), path);
    }
}

function autoCloseFW(fileWatcher: FileWatcher, callback: (fw: FileWatcher) => void): void {
    try {
        callback(fileWatcher);
    } finally {
        fileWatcher.unwatchAll();
    }
}

test.serial.skip('FileWatcher should watch files added with watchFiles', t => {
    useSandboxDirectory(() => {
        const changes: string[] = [];
        autoCloseFW(new FileWatcher(changedPath => changes.push(changedPath)), (fw) => {
            touchFiles('test1.txt', 'test2.txt');
            fw.watchFiles(getSandboxPath('test1.txt'), getSandboxPath('test2.txt'));
            fw.start();

            touchFiles('test1.txt', 'test2.txt');

            t.deepEqual(changes, [
                'test1.txt',
                'test2.txt'
            ]);
        });
    });
});

test.serial.skip('FileWatcher should not watch files removed with unwatchFiles', t => {
    useSandboxDirectory(() => {
        const changes: string[] = [];
        autoCloseFW(new FileWatcher(changedPath => changes.push(changedPath)), (fw) => {
            touchFiles('test1.txt', 'test2.txt');
            fw.watchFiles(getSandboxPath('test1.txt'), getSandboxPath('test2.txt'));
            fw.unwatchFiles(getSandboxPath('test2.txt'));
            fw.start();

            touchFiles('test1.txt', 'test2.txt');

            t.deepEqual(changes, [
                'test1.txt'
            ]);
        });
    });
});

test.serial.skip('FileWatcher should sync watch list with setWatchedFiles', t => {
    useSandboxDirectory(() => {
        const changes: string[] = [];
        autoCloseFW(new FileWatcher(changedPath => changes.push(changedPath)), (fw) => {
            touchFiles('test1.txt', 'test2.txt', 'test3.txt');
            fw.watchFiles(getSandboxPath('test1.txt'), getSandboxPath('test2.txt'));
            fw.setWatchedFiles([getSandboxPath('test1.txt'), getSandboxPath('test3.txt')]);
            fw.start();

            touchFiles('test1.txt', 'test2.txt', 'test3.txt');

            t.deepEqual(changes, [
                'test1.txt',
                'test3.txt'
            ]);
        });
    });
});

test.serial.skip('FileWatcher ignores unwatched files', t => {
    useSandboxDirectory(() => {
        const changes: string[] = [];
        autoCloseFW(new FileWatcher(changedPath => changes.push(changedPath)), (fw) => {
            touchFiles('test1.txt');
            fw.watchFiles(getSandboxPath('test1.txt'));
            fw.start();

            touchFiles('test1.txt', 'test2.txt');

            t.deepEqual(changes, [
                'test1.txt'
            ]);
        });
    });
});

test.serial.skip('FileWatcher ignores duplicate watches', t => {
    useSandboxDirectory(() => {
        const changes: string[] = [];
        autoCloseFW(new FileWatcher(changedPath => changes.push(changedPath)), (fw) => {
            touchFiles('test1.txt');
            fw.watchFiles(getSandboxPath('test1.txt'), getSandboxPath('test1.txt'), getSandboxPath('test1.txt'));
            fw.start();

            touchFiles('test1.txt');

            t.deepEqual(changes, [
                'test1.txt'
            ]);
        });
    });
});

test.serial.skip('FileWatcher ignores duplicate unwatches', t => {
    useSandboxDirectory(() => {
        const changes: string[] = [];
        autoCloseFW(new FileWatcher(changedPath => changes.push(changedPath)), (fw) => {
            touchFiles('test1.txt', 'test2.txt');
            fw.watchFiles(getSandboxPath('test1.txt'), getSandboxPath('test2.txt'));
            fw.unwatchFiles(getSandboxPath('test2.txt'));
            fw.unwatchFiles(getSandboxPath('test2.txt'));
            fw.unwatchFiles(getSandboxPath('test2.txt'));
            fw.start();

            touchFiles('test1.txt', 'test2.txt');

            t.deepEqual(changes, [
                'test1.txt'
            ]);
        });
    });
});

test.serial.skip('FileWatcher detects multiple writes to same file', t => {
    useSandboxDirectory(() => {
        const changes: string[] = [];
        autoCloseFW(new FileWatcher(changedPath => changes.push(changedPath)), (fw) => {
            touchFiles('test1.txt');
            fw.watchFiles(getSandboxPath('test1.txt'));
            fw.start();

            touchFiles('test1.txt');

            t.deepEqual(changes, [
                'test1.txt',
                'test1.txt',
                'test1.txt'
            ]);
        });
    });
});


test.serial.skip('FileWatcher can pause', t => {
    useSandboxDirectory(() => {
        const changes: string[] = [];
        autoCloseFW(new FileWatcher(changedPath => changes.push(changedPath)), (fw) => {
            touchFiles('test1.txt');
            fw.watchFiles(getSandboxPath('test1.txt'));
            fw.start();

            touchFiles('test1.txt');
            fw.stop();
            touchFiles('test1.txt');

            t.deepEqual(changes, [
                'test1.txt'
            ]);
        });
    });
});

test.serial.skip('FileWatcher can resume', t => {
    useSandboxDirectory(() => {
        const changes: string[] = [];
        autoCloseFW(new FileWatcher(changedPath => {
            changes.push(changedPath);
            console.log('hit watcher', changedPath);
        }), (fw) => {
            touchFiles('test1.txt');
            fw.watchFiles(getSandboxPath('test1.txt'));
            fw.start();

            touchFiles('test1.txt');
            fw.stop();
            touchFiles('test1.txt');
            fw.start();
            touchFiles('test1.txt');

            t.deepEqual(changes, [
                'test1.txt',
                'test1.txt'
            ]);
        });
    });
});
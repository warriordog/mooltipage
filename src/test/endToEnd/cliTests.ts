import test
    from 'ava';
import {CliArgs} from '../../bin/args';
import {
    copyTestData,
    getTestDataPath,
    useSandboxDirectory
} from '../_util/testFsUtils';
import {
    cliMain,
    printHelp,
    runApp
} from '../../bin';
import fs
    from 'fs';
import {join} from 'path';
import {TestCliConsole} from '../_util/testCliConsole';

test('CLI responds to file changes and deletions in watch mode', async t => {
    t.timeout(3000);
    await useSandboxDirectory(async sandboxPath => {
        // Compute file paths
        const outputPath = join(sandboxPath, 'output');
        const inputPath = join(sandboxPath, 'input');
        const inputTestPage = join (inputPath, 'testPage.html');

        // Stage test data
        await copyTestData(inputPath);

        const cliConsole = new TestCliConsole();
        cliConsole.onErrorCallbacks.push(message => t.fail(`Caught error output: ${ message }`));

        const args: CliArgs = {
            inPath: inputPath,
            outPath: outputPath,
            formatter: 'none',
            pages: [ inputTestPage ],
            watch: true
        };

        // Run initial compile
        await runApp(args, cliConsole);

        // Wait for update (this is first in case the watcher responds before writeFile returns
        const waitPromise = cliConsole.waitForLog((msg => String(msg).includes('testPage.html')));

        // Modify main page
        await fs.promises.writeFile(inputTestPage, '<!-- test! -->', { encoding: 'utf-8' });

        // Wait for file to be modified
        await waitPromise;
        t.pass();
    });
});

test('runApp() compiles test project', async t => {
    await useSandboxDirectory(async (sandboxPath) => {
        const cliConsole = new TestCliConsole();
        cliConsole.onErrorCallbacks.push(message => t.fail(`Caught error output: ${ message }`));

        const args: CliArgs = {
            inPath: getTestDataPath(),
            outPath: sandboxPath,
            formatter: 'minimized',
            pages: [
                getTestDataPath('testPage.html'),
                getTestDataPath('testFolder/subFolder')
            ]
        };

        await runApp(args, cliConsole);

        // test file creation
        t.true(fs.existsSync(join(sandboxPath, 'testPage.html')));
        t.true(fs.existsSync(join(sandboxPath, 'testFolder/subFolder/subPage1.html')));
        t.true(fs.existsSync(join(sandboxPath, 'testFolder/subFolder/subPage2.html')));

        // test logs
        t.true(cliConsole.logs.some(log => log.includes('testPage.html')));
        t.true(cliConsole.logs.some(log => log.includes('subPage1.html')));
        t.true(cliConsole.logs.some(log => log.includes('subPage2.html')));
        t.true(cliConsole.logs.some(log => log.includes('Done.')));
    });
});


test('cliMain() with --help shows help', async t => {
    const cliConsole = new TestCliConsole();
    cliConsole.onErrorCallbacks.push(message => t.fail(`Caught error output: ${ message }`));
    const args = [ '--help' ];
    await cliMain(args, cliConsole);
    t.true(cliConsole.logs.some(log => log.includes('Usage: ')));
});
test('cliMain() with no args shows help', async t => {
    const cliConsole = new TestCliConsole();
    cliConsole.onErrorCallbacks.push(message => t.fail(`Caught error output: ${ message }`));
    await cliMain([], cliConsole);
    t.true(cliConsole.logs.some(log => log.includes('Usage: ')));
});
test('cliMain() with no pages shows warning', async t => {
    const cliConsole = new TestCliConsole();
    await cliMain([ '--formatter=pretty' ], cliConsole);
    t.true(cliConsole.logs.some(log => log.includes('No input pages specified.')));
});
test('cliMain() compiles test project', async t => {
    await useSandboxDirectory(async (sandboxPath) => {
        const cliConsole = new TestCliConsole();
        cliConsole.onErrorCallbacks.push(message => t.fail(`Caught error output: ${ message }`));
        const args = [ `--inpath=${ getTestDataPath() }`, `--outpath=${ sandboxPath }`, '--formatter=pretty', getTestDataPath('testPage.html') ];

        await cliMain(args, cliConsole);

        t.true(fs.existsSync(join(sandboxPath, 'testPage.html')));

        t.true(cliConsole.logs.some(log => log.includes('testPage.html')));
        t.true(cliConsole.logs.some(log => log.includes('Done.')));
    });
});

test('printHelp() prints help to console', t => {
    const cliConsole = new TestCliConsole();
    cliConsole.onErrorCallbacks.push(message => t.fail(`Caught error output: ${ message }`));
    printHelp(cliConsole);

    t.true(cliConsole.logs.some(log => log.includes('Usage: ')));
});
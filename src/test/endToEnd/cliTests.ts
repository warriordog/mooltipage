import test
    from 'ava';
import {CliArgs} from '../../bin/args';
import {
    getSandboxPath,
    getTestDataPath,
    useSandboxDirectory
} from '../_util/testFsUtils';
import {
    CliConsole,
    cliMain,
    printHelp,
    runApp
} from '../../bin/cli';
import fs
    from 'fs';
import os
    from 'os';

class TestCliConsole implements CliConsole {
    logs: string[] = [];

    log(message?: string): void {
        if (message === undefined) {
            message = os.EOL;
        }
        this.logs.push(message);
    }
}
test('runApp() compiles test project', t => {
    useSandboxDirectory(() => {
        const cliConsole = new TestCliConsole();

        const args: CliArgs = {
            inPath: getTestDataPath(),
            outPath: getSandboxPath(),
            formatter: 'minimized',
            pages: [
                getTestDataPath('testPage.html'),
                getTestDataPath('testFolder/subFolder')
            ]
        };

        runApp(args, cliConsole);

        // test file creation
        t.true(fs.existsSync(getSandboxPath('testPage.html')));
        t.true(fs.existsSync(getSandboxPath('testFolder/subFolder/subPage1.html')));
        t.true(fs.existsSync(getSandboxPath('testFolder/subFolder/subPage2.html')));

        // test logs
        t.true(cliConsole.logs.some(log => log.includes('testPage.html')));
        t.true(cliConsole.logs.some(log => log.includes('subPage1.html')));
        t.true(cliConsole.logs.some(log => log.includes('subPage2.html')));
        t.true(cliConsole.logs.some(log => log.includes('Done.')));
    });
});


test('cliMain() with --help shows help', t => {
    const cliConsole = new TestCliConsole();
    const args = [ '--help' ];
    cliMain(args, cliConsole);
    t.true(cliConsole.logs.some(log => log.includes('Usage: ')));
});
test('cliMain() with no args shows help', t => {
    const cliConsole = new TestCliConsole();
    cliMain([], cliConsole);
    t.true(cliConsole.logs.some(log => log.includes('Usage: ')));
});
test('cliMain() with no pages shows warning', t => {
    const cliConsole = new TestCliConsole();
    cliMain([ '--formatter=pretty' ], cliConsole);
    t.true(cliConsole.logs.some(log => log.includes('No input pages specified.')));
});
test('cliMain() compiles test project', t => {
    useSandboxDirectory(() => {
        const cliConsole = new TestCliConsole();
        const args = [ `--inpath=${ getTestDataPath() }`, `--outpath=${ getSandboxPath() }`, '--formatter=pretty', getTestDataPath('testPage.html') ];

        cliMain(args, cliConsole);

        t.true(fs.existsSync(getSandboxPath('testPage.html')));

        t.true(cliConsole.logs.some(log => log.includes('testPage.html')));
        t.true(cliConsole.logs.some(log => log.includes('Done.')));
    });
});

test('printHelp() prints help to console', t => {
    const cliConsole = new TestCliConsole();
    printHelp(cliConsole);

    t.true(cliConsole.logs.some(log => log.includes('Usage: ')));
});
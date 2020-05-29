#!/usr/bin/env node

import os from 'os';
import { Args, parseArgs, ParseResult } from './args';
import MooltiPageCli from './mooltiPageCli';
import CliFileSystem from './io/cliFileSystem';
import NodeCliFileSystem from './io/nodeCliFileSystem';

console.log('MooltiPage CLI' + os.EOL);

// parse arguments
const parseResult: ParseResult = parseArgs(process.argv.slice(2));
if (parseResult.isValid) {
    // get parsed arguments
    const args: Args = parseResult.getArgs();

    // init CLI engine
    const cliFs: CliFileSystem = new NodeCliFileSystem();
    const cli: MooltiPageCli = new MooltiPageCli(args, cliFs);

    // process
    cli.runCompile();
} else {
    // print feedback
    console.log(parseResult.getOutput());
}

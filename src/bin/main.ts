#!/usr/bin/env node

import os from 'os';
import { CliArgs, parseArgs } from './args';
import { MooltiPageCli } from './mooltiPageCli';
import { CliFileSystem } from './io/cliFileSystem';
import { NodeCliFileSystem } from './io/nodeCliFileSystem';


console.log('MooltiPage CLI' + os.EOL);

// parse arguments
const args: CliArgs = parseArgs(process.argv.slice(2));

if (args.isHelp) {
    printHelp();
} else if (args.pages.length === 0) {
    printMissingInput();
} else {
    runApp();
}

function runApp(): void {
    // init CLI engine
    const cliFs: CliFileSystem = new NodeCliFileSystem();
    const cli: MooltiPageCli = new MooltiPageCli(args, cliFs);

    // process
    cli.runCompile();
}

function printHelp(): void {
    console.log(
        'Usage: mooltipage [options] <page1> [page2 [page3...]]' + os.EOL +
        'Pages can be individual files or entire directories.' + os.EOL +
        'Directories will be recursively searched, and all HTML contents will be treated as pages.' + os.EOL +
        'If inPath and outPath are not specified, then they will default to the current working directory.' + os.EOL +
        'If no outPath is specified, then source pages will be overwritten when compiled.' + os.EOL +
        os.EOL +
        'Options:' + os.EOL +
        '  --help                               Print this help and exit.' + os.EOL +
        '  --inPath=<input_path>                Specify a folder to read inputs from' + os.EOL +
        '  --outPath=<output_path>              Specify a folder to write outputs to' + os.EOL +
        '  --formatter=<formatter_name>         Use an HTML formatter (default "pretty")'
    );
}

function printMissingInput(): void {
    console.log('No input pages specified.');
}
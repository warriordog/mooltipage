#!/usr/bin/env node

import os from 'os';
import { CliArgs, parseArgs } from './args';
import { Mooltipage } from '../lib';
import * as FsUtils from '../lib/fs/fsUtils';

console.log(`Mooltipage CLI${ os.EOL }`);

// parse arguments
const args: CliArgs = parseArgs(process.argv.slice(2));

if (args.isHelp) {
    printHelp();
} else if (args.pages.length === 0) {
    console.log('No input pages specified.');
} else {
    runApp();
}

function runApp(): void {
    // create mooltipage instance
    const mooltipage = new Mooltipage({
        inPath: args.inPath,
        outPath: args.outPath,
        formatter: args.formatter,
        onPageCompiled: page => console.log(`Compiled [${ page.path }].`)
    });

    // convert page arguments into full list of pages
    const basePath = args.inPath ?? process.cwd();
    const pages = FsUtils.expandPagePaths(args.pages, basePath);

    // print stats
    console.log(`Source path: [${ args.inPath ?? '*unspecified*' }]`);
    console.log(`Destination path: [${ args.outPath ?? '*unspecified*' }]`);
    console.log(`Page count: ${ pages.length }`);
    console.log();

    // compile each page
    mooltipage.processPages(pages);

    console.log();
    console.log('Done.');
}

function printHelp(): void {
    console.log(
        `Usage: mooltipage [options] <page1> [page2 [page3...]]
        Pages can be individual files or entire directories.
        Directories will be recursively searched, and all HTML contents will be treated as pages.
        If inPath and outPath are not specified, then they will default to the current working directory.
        If no outPath is specified, then source pages will be overwritten when compiled.
        
        Options:
            --help                               Print this help and exit.
            --inPath=<input_path>                Specify a folder to read inputs from
            --outPath=<output_path>              Specify a folder to write outputs to
            --formatter=<formatter_name>         Use an HTML formatter (default "pretty")`
    );
}
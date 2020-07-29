#!/usr/bin/env node

import os from 'os';
import { CliArgs, parseArgs } from './args';
import { Mooltipage, FsUtils } from '../lib';


console.log(`MooltiPage CLI${  os.EOL }`);

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
    // create mooltipage instance
    const mooltipage = new Mooltipage({
        inPath: args.inPath,
        outPath: args.outPath,
        formatter: args.formatter,
        onPageCompiled: (pagePath) => console.log(`Compiled [${ pagePath }].`)
    });

    // convert page arguments into full list of pages
    const pages = FsUtils.expandPagePaths(args.pages, args.inPath);

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
        `Usage: mooltipage [options] <page1> [page2 [page3...]]${ os.EOL }
        Pages can be individual files or entire directories.${ os.EOL }
        Directories will be recursively searched, and all HTML contents will be treated as pages.${ os.EOL }
        If inPath and outPath are not specified, then they will default to the current working directory.${ os.EOL }
        If no outPath is specified, then source pages will be overwritten when compiled.${ os.EOL }
        ${ os.EOL }
        Options:${ os.EOL }
            --help                               Print this help and exit.${ os.EOL }
            --inPath=<input_path>                Specify a folder to read inputs from${ os.EOL }
            --outPath=<output_path>              Specify a folder to write outputs to${ os.EOL }
            --formatter=<formatter_name>         Use an HTML formatter (default "pretty")`
    );
}

function printMissingInput(): void {
    console.log('No input pages specified.');
}
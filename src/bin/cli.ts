import {
    CliArgs,
    parseArgs
} from './args';
import {Mooltipage} from '../lib';
import {
    expandPagePaths,
    readPackageJson
} from './cliFs';

export function cliMain(argv: string[], cliConsole: CliConsole): void {
    const version = readPackageJson().version;
    cliConsole.log(`Mooltipage CLI ver. ${ version }`);
    cliConsole.log();

    // parse arguments
    const args: CliArgs = parseArgs(argv);

    if (args.isHelp) {
        printHelp(cliConsole);
    } else if (args.pages.length === 0) {
        cliConsole.log('No input pages specified.');
    } else {
        runApp(args, cliConsole);
    }
}

export function runApp(args: CliArgs, cliConsole: CliConsole): void {
    // create mooltipage instance
    const mooltipage = new Mooltipage({
        inPath: args.inPath,
        outPath: args.outPath,
        formatter: args.formatter,
        onPageCompiled: page => cliConsole.log(`Compiled [${ page.path }].`)
    });

    // convert page arguments into full list of pages
    const basePath = args.inPath ?? process.cwd();
    const pages = expandPagePaths(args.pages, basePath);

    // print stats
    cliConsole.log(`Source path: [${ args.inPath ?? process.cwd() }]`);
    cliConsole.log(`Destination path: [${ args.outPath ?? process.cwd() }]`);
    cliConsole.log(`Page count: ${ pages.length }`);
    cliConsole.log();

    // compile each page
    mooltipage.processPages(pages);

    cliConsole.log();
    cliConsole.log('Done.');
}

export function printHelp(cliConsole: CliConsole): void {
    cliConsole.log(
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

/**
 * Console interface to receive output from CLI
 */
export interface CliConsole {
    /**
     * Receives a console message.
     * @param message Message to log
     */
    log(message?: string): void;
}
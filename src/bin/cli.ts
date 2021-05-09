import {
    CliArgs,
    parseArgs
} from './args';
import {
    readPackageJson
} from './cliFs';
import {CliEngine} from './cliEngine';
import {WatchingCliEngine} from './watch/watchingCliEngine';

export async function cliMain(argv: string[], cliConsole: CliConsole): Promise<void> {
    const version = (await readPackageJson()).version;
    cliConsole.log(`Mooltipage CLI ver. ${ version }`);
    cliConsole.log();

    // parse arguments
    const args: CliArgs = parseArgs(argv);

    if (args.isHelp) {
        printHelp(cliConsole);
    } else if (args.pages.length === 0) {
        cliConsole.log('No input pages specified.');
    } else {
        await runApp(args, cliConsole);
    }
}

function makeCliEngine(args: CliArgs, cliConsole: CliConsole): CliEngine {
    if (args.watch) {
        return new WatchingCliEngine(args, cliConsole);
    } else {
        return new CliEngine(args, cliConsole);
    }
}

export async function runApp(args: CliArgs, cliConsole: CliConsole): Promise<void> {
    // Create an engine instance based on args
    const cliEngine = makeCliEngine(args, cliConsole);

    // Run it
    await cliEngine.runApp();
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
     * Receives a console message at "log" level.
     * Should function exactly the same as {@link console.log}.
     * @param message Message to log
     * @param optionalParams Optional parameters to attach to the message.
     */
    log(message?: unknown, ...optionalParams: unknown[]): void;

    /**
     * Receives a console message at "error" level.
     * Should function exactly the same as {@link console.error}.
     * @param message Message to log
     * @param optionalParams Optional parameters to attach to the message.
     */
    error(message?: unknown, ...optionalParams: unknown[]): void;
}
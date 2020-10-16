import {
    CliArgs,
    parseArgs
} from './args';
import {Mooltipage} from '../lib';
import {
    expandPagePaths,
    readPackageJson
} from './cliFs';
import {FileWatcher} from './fileWatcher';
import Timeout = NodeJS.Timeout;

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

    // we are done
    cliConsole.log();
    cliConsole.log('Done.');

    // enter watch mode, if enabled
    if (args.watch) {
        console.log('Entering watch mode - changes to any project files will trigger a recompile of the affected pages.');
        enterWatchMode(mooltipage);
    }
}

function enterWatchMode(mooltipage: Mooltipage): void {
    // queue up modified files to avoid recompiling partial changes
    const stagedChanges = new Set<string>();

    let applyChangesTimer: Timeout | undefined = undefined;

    // create file watcher
    const fileWatcher = new FileWatcher((changedFile => {
        // add to staged changes
        stagedChanges.add(changedFile);

        // start timer on changes
        if (applyChangesTimer !== undefined) {
            applyChangesTimer.refresh();
        }
    }));

    // create timer to apply changes
    applyChangesTimer = setTimeout(() => {
        if (stagedChanges.size > 0) {
            try {
                fileWatcher.stop();

                // get list of files to recompile and clear
                const filesToRecompile = new Set(stagedChanges);
                stagedChanges.clear();

                // compile changes
                compileStagedChanges(filesToRecompile, mooltipage);

                // reset watched files
                watchCurrentFiles(fileWatcher, mooltipage);
            } catch (e) {
                console.error(e);

            } finally {
                stagedChanges.clear();
                fileWatcher.start();
            }
        }
    }, 250);

    // watch files
    watchCurrentFiles(fileWatcher, mooltipage);

    // enable
    fileWatcher.start();
}

function compileStagedChanges(stagedChanges: Set<string>, mooltipage: Mooltipage): void {
    const tracker = mooltipage.pipeline.dependencyTracker;

    // get list of pages for changes
    const changedPages = new Set<string>();
    for (const change of stagedChanges) {
        // convert raw path back to res path
        const resPath = mooltipage.pipeline.pipelineIO.getSourceResPathForAbsolutePath(change);

        if (tracker.hasTrackedPage(resPath)) {
            // copy pages directly
            changedPages.add(resPath);
        }

        if (tracker.hasTrackedResource(resPath)) {
            // for resources, find and add all dependent pages
            for (const dependentPage of tracker.getDependentsForResource(resPath)) {
                changedPages.add(dependentPage);
            }
        }
    }

    // compile changes
    mooltipage.processPages(changedPages);
}

function watchCurrentFiles(fileWatcher: FileWatcher, mooltipage: Mooltipage): void {
    // get list of absolute paths to all files
    const allFiles = new Set(
        Array.from(mooltipage.pipeline.dependencyTracker.getAllTrackedFiles())
            .map(resPath => mooltipage.pipeline.pipelineIO.resolveSourceResource(resPath))
    );

    // watch all files
    fileWatcher.setWatchedFiles(allFiles);
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
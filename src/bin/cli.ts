import {
    CliArgs,
    parseArgs
} from './args';
import {
    Mooltipage,
    PipelineIO
} from '../lib';
import {
    expandPagePaths,
    readPackageJson
} from './cliFs';
import { PipelineIOImpl } from '../lib/pipeline/standardPipeline';
import Timeout = NodeJS.Timeout;
import {DependencyTracker} from './watch/dependencyTracker';
import {
    TrackingCache,
    TrackingPipelineIO
} from './watch/trackers';
import {FileWatcher} from './watch/fileWatcher';

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
    if (args.watch) {
        runAppWatch(args, cliConsole);
        
    } else {
        runAppSingle(args, cliConsole);
    }
}

function runAppSingle(args: CliArgs, cliConsole: CliConsole): void {
    // create mooltipage instance
    const mooltipage = new Mooltipage({
        inPath: args.inPath,
        outPath: args.outPath,
        formatter: args.formatter,
        onPageCompiled: page => cliConsole.log(`Compiled [${ page.path }].`)
    });
    
    // compile pages
    runAppCommon(args, cliConsole, mooltipage);
}

function runAppWatch(args: CliArgs, cliConsole: CliConsole): void {
    // initialize tracking data
    const dependencyTracker = new DependencyTracker();
    const currentDependencies = new Set<string>();

    // create shared callback to collect dependencies from all shared trackers
    const trackerCallback = function(resPath: string): void {
        currentDependencies.add(resPath);
    };

    // we are in watch mode, so create a tracking pipeline IO
    const inPath = args.inPath ?? process.cwd();
    const outPath = args.outPath ?? process.cwd();
    const realIO = new PipelineIOImpl(inPath, outPath);
    const trackingIO = new TrackingPipelineIO(realIO, trackerCallback);
    
    // create mooltipage instance
    const mooltipage = new Mooltipage({
        inPath: args.inPath,
        outPath: args.outPath,
        pipelineIO: trackingIO,
        formatter: args.formatter,
        onPageCompiled: page => {
            // update dependencies for page
            dependencyTracker.setPageDependencies(page.path, currentDependencies);

            // reset tracker
            currentDependencies.clear();

            cliConsole.log(`Compiled [${ page.path }].`);
        }
    });

    // inject tracking cache
    mooltipage.pipeline.cache.fragmentCache = new TrackingCache(mooltipage.pipeline.cache.fragmentCache, trackerCallback);
    
    // run initial round of compilation
    runAppCommon(args, cliConsole, mooltipage);
    
    // enter watch mode
    cliConsole.log('Entering watch mode - modified files will be rebuilt automatically.');
    enterWatchMode(mooltipage, dependencyTracker, cliConsole);
}

function runAppCommon(args: CliArgs, cliConsole: CliConsole, mooltipage: Mooltipage): void {
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
}

function enterWatchMode(mooltipage: Mooltipage, tracker: DependencyTracker, cliConsole: CliConsole): void {
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
                compileStagedChanges(filesToRecompile, mooltipage, tracker);

                // reset watched files
                watchCurrentFiles(fileWatcher, mooltipage.pipeline.pipelineIO, tracker);
            } catch (e) {
                cliConsole.error(e);

            } finally {
                stagedChanges.clear();
                fileWatcher.start();
            }
        }
    }, 250);

    // watch files
    watchCurrentFiles(fileWatcher, mooltipage.pipeline.pipelineIO, tracker);

    // enable
    fileWatcher.start();
}

function compileStagedChanges(stagedChanges: Set<string>, mooltipage: Mooltipage, tracker: DependencyTracker): void {
    // list of pages with changes
    const changedPages = new Set<string>();

    // find pages impacted by each changed file
    for (const stagedChange of stagedChanges) {
        // convert raw path back to res path
        const stagedChangePath = mooltipage.pipeline.pipelineIO.getSourceResPathForAbsolutePath(stagedChange);

        // if this is a page, then add directly
        if (tracker.hasPage(stagedChangePath)) {
            changedPages.add(stagedChangePath);
        }

        // find and add all pages that depend on this
        const dependentPages = tracker.getDependentsForResource(stagedChangePath);
        for (const dependentPage of dependentPages) {
            changedPages.add(dependentPage);
        }

        // clear cache for staged changes (including resources, not just pages)
        mooltipage.pipeline.cache.fragmentCache.remove(stagedChangePath);
    }

    // compile changes
    mooltipage.processPages(changedPages);
}

function watchCurrentFiles(fileWatcher: FileWatcher, pipelineIO: PipelineIO, tracker: DependencyTracker): void {
    // get list of absolute paths to all files
    const allFiles = new Set<string>();
    for (const trackedFile of tracker.getAllTrackedFiles()) {
        allFiles.add(pipelineIO.resolveSourceResource(trackedFile));
    }

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
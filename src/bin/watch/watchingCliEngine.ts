import {CliEngine} from '../cliEngine';
import {DependencyTracker} from './dependencyTracker';
import { Mooltipage } from '../../lib';
import {PipelineIOImpl} from '../../lib/pipeline/standardPipeline';
import {
    TrackingCache,
    TrackingPipelineIO
} from './trackers';
import {FSWatcher} from 'chokidar';
import {
    createReadyFSWatcher,
    onAny,
    setWatched
} from './FSWatcherUtils';

export class WatchingCliEngine extends CliEngine {
    readonly dependencyTracker = new DependencyTracker();
    readonly stagedChanges = new Set<string>();
    private isWatching = false;

    async runApp(): Promise<void> {
        // Run initial compilation
        await super.runApp();

        // enter watch mode
        await this.enterWatchMode();
        this.cliConsole.log('Entering watch mode - modified files will be rebuilt automatically.');
    }

    protected createMooltipage(): Mooltipage {
        // initialize tracking data
        const currentDependencies = new Set<string>();

        // create shared callback to collect dependencies from all shared trackers
        const trackerCallback = function(resPath: string): void {
            currentDependencies.add(resPath);
        };

        // we are in watch mode, so create a tracking pipeline IO
        const inPath = this.args.inPath ?? process.cwd();
        const outPath = this.args.outPath ?? process.cwd();
        const realIO = new PipelineIOImpl(inPath, outPath);
        const trackingIO = new TrackingPipelineIO(realIO, trackerCallback);

        // create mooltipage instance
        const mooltipage = new Mooltipage({
            inPath: this.args.inPath,
            outPath: this.args.outPath,
            pipelineIO: trackingIO,
            formatter: this.args.formatter,
            onPageCompiled: async page => {
                // update dependencies for page
                this.dependencyTracker.setPageDependencies(page.path, currentDependencies);

                // reset tracker
                currentDependencies.clear();

                this.cliConsole.log(`Compiled [${ page.path }].`);
            }
        });

        // inject tracking cache
        mooltipage.pipeline.cache.fragmentCache = new TrackingCache(mooltipage.pipeline.cache.fragmentCache, trackerCallback);
        
        return mooltipage;
    }

    private async enterWatchMode(): Promise<void> {
        // create file watcher
        const fileWatcher = await createReadyFSWatcher({
            disableGlobbing: true,
            persistent: true,
            ignoreInitial: true,
            useFsEvents: true
        });

        // create timer to apply changes
        const applyChangesTimer = setTimeout(() => this.checkAndApplyStagedChanges(fileWatcher), 300);

        // watch files
        this.watchCurrentFiles(fileWatcher);

        // Define callback for FS events
        onAny(fileWatcher, [ 'change', 'unlink', 'unlinkDir' ], (_, changedFile) => {
            // Only respond to events if we are actually in watch mode
            if (this.isWatching) {
                // add to staged changes
                this.stagedChanges.add(changedFile);

                // start timer on changes
                applyChangesTimer.refresh();
            }
        });

        // enable
        this.isWatching = true;
    }
    
    private async checkAndApplyStagedChanges(fileWatcher: FSWatcher): Promise<void> {
        if (this.stagedChanges.size > 0) {
            try {
                this.isWatching = false;

                // get list of files to recompile and clear
                const filesToRecompile = new Set(this.stagedChanges);
                this.stagedChanges.clear();

                // compile changes
                await this.compileChangeSet(filesToRecompile);

                // reset watched files
                this.watchCurrentFiles(fileWatcher);
            } catch (e) {
                this.cliConsole.error(e);

            } finally {
                this.stagedChanges.clear();
                this.isWatching = true;
            }
        }
    }

    private async compileChangeSet(changeSet: Set<string>): Promise<void> {
        // list of pages with changes
        const changedPages = new Set<string>();

        // find pages impacted by each changed file
        for (const stagedChange of changeSet) {
            // convert raw path back to res path
            const stagedChangePath = this.mooltipage.pipeline.pipelineIO.getSourceResPathForAbsolutePath(stagedChange);

            // if this is a page, then add directly
            if (this.dependencyTracker.hasPage(stagedChangePath)) {
                changedPages.add(stagedChangePath);
            }

            // find and add all pages that depend on this
            const dependentPages = this.dependencyTracker.getDependentsForResource(stagedChangePath);
            for (const dependentPage of dependentPages) {
                changedPages.add(dependentPage);
            }

            // clear cache for staged changes (including resources, not just pages)
            this.mooltipage.pipeline.cache.fragmentCache.remove(stagedChangePath);
        }

        // compile changes
        await this.mooltipage.processPages(changedPages);
    }

    private watchCurrentFiles(fileWatcher: FSWatcher): void {
        // get list of absolute paths to all files
        const allFiles = Array.from(new Set<string>(Array.from(this.dependencyTracker.getAllTrackedFiles())
            .map(trackedFile => this.mooltipage.pipeline.pipelineIO.resolveSourceResource(trackedFile))
        ));

        // watch all files
        setWatched(fileWatcher, allFiles);
    }
}
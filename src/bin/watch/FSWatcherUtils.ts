import {
    FSWatcher,
    WatchOptions
} from 'chokidar';

export async function createReadyFSWatcher(options?: WatchOptions): Promise<FSWatcher> {
    // Create the watcher instance
    const watcher = new FSWatcher(options);

    // Flag to stop keep-alive timer after watcher is ready.
    // Otherwise, Node.JS would never exit.
    let isReady = false;
    watcher.add(__dirname);

    // Keep-alive timer to stop Node.JS from shutting down before watcher is ready.
    // Apparently the "persistent" property does not kick in until *after* the initial scan / ready event.
    const keepAlive = setTimeout(() => {
        if (!isReady) {
            // Refresh the timer if the watcher isn't ready
            keepAlive.refresh();
        }
    }, 10);

    // Watch a single file to force the initial scan.
    // If we don't do this here, then the ready event will never fire.
    // But if we don't wait for ready, then the first set of watchers may not bind correctly.
    // This especially causes problems on Mac OS.
    watcher.add(__filename);

    // Create a promise bound to the ready event, then wait for it
    await new Promise<void>((resolve, reject) => {
        // Resolve on "ready" event
       watcher.on('ready', () => {
           isReady = true;
           resolve();
       });

       // Reject/throw on errors
       watcher.on('error', reject);
    });

    // Remove the file we watched earlier to guarantee a clean state for the caller.
    await watcher.unwatch(__filename);

    // Return the watcher, which is now ready to use.
    return watcher;
}

export function watchPaths(watcher: FSWatcher, paths: readonly string[]): void;
export function watchPaths(watcher: FSWatcher, ...paths: readonly string[]): void;
export function watchPaths(watcher: FSWatcher, ...paths: ReadonlyArray<string | readonly string[]>): void {
    // Flatten paths array, as TS overload syntax allows to pass in a mix of strings and string arrays
    const flatPaths = paths.flat();

    // Add to the watcher
    watcher.add(flatPaths);
}

export function getAllWatched(watcher: FSWatcher): string[] {
    const watchedObj = watcher.getWatched();
    const watchedDirs = Object.keys(watchedObj);
    const watchedFiles = Object.values(watchedObj).flat();
    return watchedDirs.concat(watchedFiles);
}

export function clearAllWatched(watcher: FSWatcher): void {
    // Get all paths to stop watching
    const watched = getAllWatched(watcher);

    // Stop watching
    watcher.unwatch(watched);
}

export function setWatched(watcher: FSWatcher, paths: readonly string[]): void;
export function setWatched(watcher: FSWatcher, ...paths: readonly string[]): void;
export function setWatched(watcher: FSWatcher, ...paths: ReadonlyArray<string | readonly string[]>): void {
    const allPaths = paths.flat();

    clearAllWatched(watcher);
    watchPaths(watcher, allPaths);
}

export type MultiWatchEvent = 'add'|'addDir'|'change'|'unlink'|'unlinkDir';
export function onAny(watcher: FSWatcher, events: readonly MultiWatchEvent[], callback: (event: MultiWatchEvent, path: string) => void): void {
    for (const event of events) {
        watcher.on(event, (path) => callback(event, path));
}
}
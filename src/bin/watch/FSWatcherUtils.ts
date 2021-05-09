import { FSWatcher } from 'chokidar';

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
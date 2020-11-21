import fs, {FSWatcher} from 'fs';

/**
 * Watches a set of files for changes and triggers a callback on any change.
 * Can be paused / resumed, and the list of tracked files can be modified at any time.
 *
 * To use, construct a FileWatcher with a callback provided as the parameter.
 * Call {@link watchFiles} or {@link setWatchedFiles} to begin watching files, then call {@link start} to activate the callback.
 * When a file is changed, the callback will be invoked with the file path as a parameter.
 * To pause the callback (but preserve the native file watchers), call {@link stop}.
 * To completely stop watching files, call {@link unwatchAll}.
 */
export class FileWatcher {
    private readonly onChangeCallback: (path: string) => void;
    private isWatching = false;
    private watchedFiles = new Map<string, FSWatcher>();

    constructor(onChangeCallback: (path: string) => void) {
        this.onChangeCallback = onChangeCallback;
    }

    /**
     * Adds one or more paths to the list of watched files.
     * Duplicate (already watched) paths will be skipped.
     * A native file watcher will be immediately created for each file, even if this FileWatcher is paused.
     * This method can be called at any time, even if this FileWatcher is active (not paused).
     * @param paths Array of paths to start watching.
     */
    watchFiles(...paths: string[]): void {
        const newWatchedFiles = new Set(paths);

        for (const newWatchPath of newWatchedFiles) {
            this.watchFile(newWatchPath);
        }
    }


    /**
     * Removes one or more paths from the list of watched files.
     * Paths that are not being watched will be skipped.
     * This method can be called at any time, even if this FileWatcher is active (not paused).
     * @param paths Array of paths to stop watching.
     */
    unwatchFiles(...paths: string[]): void {
        const newUnwatchedFiles = new Set(paths);

        for (const newUnwatchPath of newUnwatchedFiles) {
            this.unwatchFile(newUnwatchPath);
        }
    }

    /**
     * Sets the list of watched files for this FileWatcher.
     * This method will preserve existing watchers for files that were and still are watched.
     * If you want to force a new watcher to be created for every file, then call setWatchedFiles with an empty list and then call setWatchedFiles or {@link watchFiles} with the list of new files to watch.
     * This method can be called at any time, even if this FileWatcher is active (not paused).
     * @param paths Paths that should be watched. Existing watchers not in this list will be unwatched.
     */
    setWatchedFiles(paths: Iterable<string>): void {
        const newWatchedFiles = new Set(paths);

        // remove watchers for files that we are not watching
        for (const existingWatchPath of this.watchedFiles.keys()) {
            if (!newWatchedFiles.has(existingWatchPath)) {
                this.unwatchFile(existingWatchPath);
            }
        }

        // add watchers for newly watched files
        for (const newWatchPath of newWatchedFiles) {
            // this will not duplicate
            this.watchFile(newWatchPath);
        }
    }

    private watchFile(path: string): void {
        if (!this.watchedFiles.has(path)) {
            // register native FS watch on the target path
            const watcher = fs.watch(path, () => this.onFileChange(path));
            this.watchedFiles.set(path, watcher);
        }
    }
    private unwatchFile(path: string): void {
        if (this.watchedFiles.has(path)) {
            this.watchedFiles.get(path)?.close();
            this.watchedFiles.delete(path);
        }
    }

    private onFileChange(path: string): void {
        if (this.isWatching) {
            this.onChangeCallback(path);
        }
    }

    /**
     * Activate / resume this FileWatcher.
     */
    start(): void {
        this.isWatching = true;
    }

    /**
     * Pause this FileWatcher.
     * When paused, the FileWatcher's native file watches will remain active however the class callback will be muted.
     * To remove the native file watches, it is necessary to call {@link setWatchedFiles} or {@link unwatchFiles}.
     */
    stop(): void {
        this.isWatching = false;
    }

    /**
     * Stops watching all files
     */
    unwatchAll(): void {
        for (const watcher of this.watchedFiles.values()) {
            watcher.close();
        }
        this.watchedFiles.clear();
    }
}
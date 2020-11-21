import {
    Cache,
    MimeType,
    PipelineIO
} from '../../lib';

/**
 * Called when a tracker detects a dependency on a resource.
 * @param resPath Path to the dependency.
 */
export type TrackerCallback = (resPath: string) => void;

/**
 * Wrapper around {@link PipelineIO} that tracks read resources and logs them to a {@link TrackerCallback}.
 */
export class TrackingPipelineIO implements PipelineIO {
    private readonly realIO: PipelineIO;
    private readonly trackerCallback: TrackerCallback;
    
    constructor(realIO: PipelineIO, trackerCallback: TrackerCallback) {
        this.realIO = realIO;
        this.trackerCallback = trackerCallback;
    }

    get destinationPath(): string {
        return this.realIO.destinationPath;
    }
    get sourcePath(): string {
        return this.realIO.sourcePath;
    }

    createResource(type: MimeType, contents: string): string {
        return this.realIO.createResource(type, contents);
    }

    getResource(type: MimeType, resPath: string): string {
        this.trackerCallback(resPath);
        
        return this.realIO.getResource(type, resPath);
    }

    writeResource(type: MimeType, resPath: string, contents: string): void {
        return this.realIO.writeResource(type, resPath, contents);
    }

    createResPath(type: MimeType, contents: string): string {
        return this.realIO.createResPath(type, contents);
    }
    
    getDestinationResPathForAbsolutePath(rawResPath: string): string {
        return this.realIO.getDestinationResPathForAbsolutePath(rawResPath);
    }

    getSourceResPathForAbsolutePath(rawResPath: string): string {
        return this.realIO.getSourceResPathForAbsolutePath(rawResPath);
    }

    resolveDestinationResource(resPath: string): string {
        return this.realIO.resolveDestinationResource(resPath);
    }

    resolveSourceResource(resPath: string): string {
        return this.realIO.resolveSourceResource(resPath);
    }
}

/**
 * Wrapper around {@link Cache} that tracks accessed keys and logs them to a {@link TrackerCallback}.
 * This implementation can be used with any Cache that uses string keys,
 * but semantically it should only be used for caches where the key is a resource path.
 */
export class TrackingCache<TKey> implements Cache<string, TKey> {
    private readonly realCache: Cache<string, TKey>;
    private readonly trackerCallback: TrackerCallback;

    constructor(realCache: Cache<string, TKey>, trackerCallback: TrackerCallback) {
        this.realCache = realCache;
        this.trackerCallback = trackerCallback;
    }

    clear(): void {
        this.realCache.clear();
    }

    get(resPath: string): TKey {
        this.trackerCallback(resPath);

        return this.realCache.get(resPath);
    }

    has(resPath: string): boolean {
        return this.realCache.has(resPath);
    }

    remove(resPath: string): void {
        this.realCache.remove(resPath);
    }

    store(resPath: string, fragment: TKey): void {
        this.realCache.store(resPath, fragment);
    }
}
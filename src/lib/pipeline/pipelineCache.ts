import {Cache, EvalFunction, Fragment} from '..';

/**
 * Caches any data that can be reused by the pipeline
 */
export class StandardPipelineCache {
    /**
     * Cache that maps resource paths to parsed fragments.
     * Paths are not normalized or converted in any way.
     * If fuzzy / equivalent matching is needed, then the caller is responsible for pre-processing the path key.
     */
    readonly fragmentCache: Cache<string, Fragment> = new MapCache<string, Fragment>();

    /**
     * Cache that maps expression strings to parsed functions.
     * Key strings are not normalized or converted in any way.
     * If fuzzy / equivalent matching is needed, then the caller is responsible for pre-processing the key.
     */
    readonly expressionCache: Cache<string, EvalFunction<unknown>> = new MapCache<string, EvalFunction<unknown>>();

    /**
     * Cache that maps JS code to parsed functions.
     * Key strings are not normalized or converted in any way.
     * If fuzzy / equivalent matching is needed, then the caller is responsible for pre-processing the key.
     */
    readonly scriptCache: Cache<string, EvalFunction<unknown>> = new MapCache<string, EvalFunction<unknown>>();

    /**
     * Cache that maps hashes of created resources to the resource path where that resource is saved.
     * Neither hash keys nor resource paths are normalized or converted in any way.
     * If fuzzy / equivalent matching is needed, then the caller is responsible for pre-processing the hash and value.
     */
    readonly createdResourceCache: Cache<string, string> = new MapCache<string, string>();

    /**
     * Removes all stored data from all caches
     */
    clear(): void {
        this.fragmentCache.clear();
        this.expressionCache.clear();
        this.scriptCache.clear();
        this.createdResourceCache.clear();
    }
}

/**
 * Implementation of Cache that stores data in a JS Map object.
 */
class MapCache<TKey, TValue> implements Cache<TKey, TValue> {
    private readonly cacheMap = new Map<TKey, TValue>();

    get(key: TKey): TValue {
        if (!this.has(key)) {
            throw new Error('Value missing from cache - make sure to call has() before get()');
        }

        // Cast is safe because cacheMap is fully controlled and can only contain TValue,
        // unless the type system is bypassed which is out of scope.
        return this.cacheMap.get(key) as TValue;
    }

    has(key: TKey): boolean {
        return this.cacheMap.has(key);
    }

    remove(key: TKey): void {
        this.cacheMap.delete(key);
    }

    store(key: TKey, value: TValue): void {
        this.cacheMap.set(key, value);
    }

    clear(): void {
        this.cacheMap.clear();
    }
}
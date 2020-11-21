import {EvalFunction, Fragment} from '..';

/**
 * A temporary key-value storage for reusable data.
 * Data in a cache is preserved for an indeterminate amount of time, but may be evicted at any time.
 */
export interface Cache<TKey, TValue> {
    /**
     * Checks if the cache contains a mapping for a specified key.
     * @param key Key to test
     */
    has(key: TKey): boolean;

    /**
     * Retrieves the cached data associated with a key.
     * Throws an exception if no data is stored.
     * Use {@link has} to safely check if a specific key is cached.
     *
     * @param key Key to test
     * @throws If there is no value stored for key
     */
    get(key: TKey): TValue;

    /**
     * Associates value to key in the cache.
     * If there is already a value stored for key, then it is overwritten.
     * @param key Key to index
     * @param value Value to associate
     */
    store(key: TKey, value: TValue): void;

    /**
     * Removes the value associated with a key.
     * The key itself is also forgotten, meaning that a call to {@link has} after calling remove will return false.
     * @param key Key to remove
     */
    remove(key: TKey): void;

    /**
     * Removes all data stored in the cache.
     * If the cache has any internal state, then it must be fully reset as well.
     */
    clear(): void;
}

/**
 * Caches any data that can be reused by the pipeline
 */
export interface PipelineCache {
    /**
     * Cache that maps resource paths to parsed fragments.
     * Paths are not normalized or converted in any way.
     * If fuzzy / equivalent matching is needed, then the caller is responsible for pre-processing the path key.
     */
    fragmentCache: Cache<string, Fragment>;

    /**
     * Cache that maps expression strings to parsed functions.
     * Key strings are not normalized or converted in any way.
     * If fuzzy / equivalent matching is needed, then the caller is responsible for pre-processing the key.
     */
    expressionCache: Cache<string, EvalFunction<unknown>>;

    /**
     * Cache that maps JS code to parsed functions.
     * Key strings are not normalized or converted in any way.
     * If fuzzy / equivalent matching is needed, then the caller is responsible for pre-processing the key.
     */
    scriptCache: Cache<string, EvalFunction<unknown>>;

    /**
     * Cache that maps hashes of created resources to the resource path where that resource is saved.
     * Neither hash keys nor resource paths are normalized or converted in any way.
     * If fuzzy / equivalent matching is needed, then the caller is responsible for pre-processing the hash and value.
     */
    createdResourceCache: Cache<string, string>;

    /**
     * Removes all stored data from all caches
     */
    clear(): void;
}
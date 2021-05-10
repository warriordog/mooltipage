import crypto from 'crypto';

/**
 * Create a NON-CRYPTOGRAPHIC (INSECURE) hash of some pipeline content.
 * Hash algorithm should be strong enough to use for caching, but does not need to be cryptographically secure.
 * This may be called many times by the pipeline, so the algorithm used should be reasonably fast as well.
 *
 * Standard implementation uses MD5 as provided by the Node.JS Crypto module.
 * Override to change implementation
 *
 * @param content Content to hash. Should be a UTF-8 string.
 * @returns Returns a hash of content as a Base64 string
 */
export function hashMD5(content: string): string {
    // create hash instance
    const md5 = crypto.createHash('md5');

    // load the content
    md5.update(content, 'utf8');

    // calculate the hash
    const b64 = md5.digest('base64');

    // Convert to path-safe Base64
    return base64ToPathSafeBase64(b64);
}

export function base64ToPathSafeBase64(base64: string): string {
    return base64.replace(/\//g, '_');
}

export function pathSafeBas64ToBase64(pathSafeBase64: string): string {
    return pathSafeBase64.replace(/_/g, '/');
}
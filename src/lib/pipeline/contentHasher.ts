import crypto from 'crypto';

export class ContentHasher {
    /**
     * Create a NON-CRYPTOGRAPHIC (INSECURE) hash of some pipeline content.
     * Hash algorithm should be strong enough to use for caching, but does not need to be cryptographically secure.
     * This may be called many times by the pipeline, so the algorithm used should be reasonably fast as well.
     * 
     * Standard implementation uses MD5 as provided by the Node.JS Crypto module.
     * 
     * @param content Content to hash. Should be a UTF-8 string.
     * @returns Returns a hash of content as a Base64 string
     */
    fastHashContent(content: string): string {
        // create hash instance
        const md5 = crypto.createHash('md5');
        
        // load the content
        md5.update(content, 'utf8');

        // calculate the hash
        return md5.digest('base64')
    }
}
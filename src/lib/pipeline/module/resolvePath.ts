import Path from 'path';

/**
 * Computes the canonical resource path from a raw path.
 * If a basePath is provided, then it will be used to prefix the result.
 *
 * @param resPath Raw path
 * @param basePath Optional base path
 * @returns Canonical form of resPath
 */
export function resolveResPath(resPath: string, basePath?: string): string {
    // if this is not an absolute path, then compute it
    if (!resPath.startsWith('\\') && !resPath.startsWith('/')) {

        // if base path is specified, then prefix
        if (basePath != undefined) {
            // extract directory name from base path
            if (basePath.endsWith('/')) {
                // for directory paths, strip trailing /
                basePath = basePath.substring(0, basePath.length - 1);
            } else {
                // for file paths, strip filename
                basePath = Path.dirname(basePath);
            }

            // append path
            resPath = `${ basePath }/${ resPath }`;

        } else if (!resPath.startsWith('.')) {
            // add ./ prefix if missing
            resPath = `./${ resPath }`;
        }
    }

    return resPath;
}
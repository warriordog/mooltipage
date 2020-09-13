import Path from 'path';

/**
 * Computes the canonical resource path from a raw path.
 * If a basePath is provided, then it will be used to prefix the result.
 * Paths starting with "@/" or "@\" will be treated as relative to the source input directory (inPath).
 *
 * @param resPath Raw path
 * @param basePath Optional base path
 * @returns Canonical form of resPath
 */
export function resolveResPath(resPath: string, basePath?: string): string {
    // treat "@" paths as relative to root
    if (resPath.startsWith('@/') || resPath.startsWith('@\\')) {
        // replace "@/" with "./" and skip further processing.
        // the pipeline interface will resolve relative to inPath
        return `.${ Path.sep }${ resPath.slice(2) }`;
    }
    
    // ignore absolute paths
    if (resPath.startsWith('/') || resPath.startsWith('\\')) {
        return resPath;
    }

    // if base path is specified, then prefix
    if (basePath != undefined) {
        // extract directory name from base path
        if (basePath.endsWith('/') || basePath.endsWith('\\')) {
            // for directory paths, strip trailing /
            basePath = basePath.substring(0, basePath.length - 1);
        } else {
            // for file paths, strip filename
            basePath = Path.dirname(basePath);
        }

        // append path
        return `${ basePath }${ Path.sep }${ resPath }`;
    }

    // if no base path then normalize and do no further processing
    if (!resPath.startsWith('./') && !resPath.startsWith('.\\')) {
        // add ./ prefix if missing
        return `.${ Path.sep }${ resPath }`;
    } else {
        // path is already normalized
        return resPath;
    }
}

/**
 * Recomputes the relative path to targetPath from sourcePath, considering both as relative to basePath.
 * For example, the path from root/pages/page.html to root/css/style.css, when root/ is the basePath, is ../css/style.css.
 *
 * @param basePath Common base directory between sourcePath and targetPath
 * @param targetPath Path to the target resource
 * @param sourcePath Path to the source resource
 */
export function computePathBetween(basePath: string, targetPath: string, sourcePath: string): string {
    const normalBasePath = Path.normalize(`${ basePath }${ Path.sep }`);

    const resolvedTargetPath = resolveResPath(targetPath, normalBasePath);
    const normalTargetPath = Path.normalize(resolvedTargetPath);

    const resolvedSourcePath = resolveResPath(sourcePath, normalBasePath);
    const normalSourcePath = Path.normalize(resolvedSourcePath);
    const normalSourceDir = Path.dirname(normalSourcePath);

    return Path.relative(normalSourceDir, normalTargetPath);
}
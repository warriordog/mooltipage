import Path
    from 'path';

/**
 * Regex that matches on any path separator
 */
const pathSepRegex = /[/\\]/g;

/**
 * Converts path separators from either forward slash or backslash to whatever format is preferred by the local filesystem.
 * @param path Path to fix
 * @returns path with all separators aligned to the local filesystem
 */
export function fixPathSeparators(path: string): string {
    return path.replace(pathSepRegex, Path.sep);
}

/**
 * Resolves the pipeline-local path to targetPath from sourcePath, or the project root if sourcePath is not specified.
 * If targetPath begins with "@/", then the path will be resolved from the project root even if sourcePath is specified.
 * If targetPath is absolute, then it will not be modified and will be returned as-is.
 * If sourcePath is a directory path, then it will be used as-is.
 * If sourcePath is a file path, then the directory will be extracted and used.
 *
 * This function will normalize "/" and "\" to the system path delimiter.
 *
 * @param targetPath Resource path to resolve
 * @param sourcePath Optional relative source
 * @returns Resolved path to resPath
 */
export function resolveResPath(targetPath: string, sourcePath?: string): string {
    // convert path separators
    targetPath = fixPathSeparators(targetPath);

    // treat "@" paths as relative to root
    if (targetPath.startsWith(`@${ Path.sep }`)) {
        // strip the leading @/
        targetPath = targetPath.slice(2);

        // remove basePath to force relative to root
        sourcePath = undefined;
    }

    // Manually normalize relative paths
    if (!Path.isAbsolute(targetPath) && sourcePath !== undefined) {
        sourcePath = fixPathSeparators(sourcePath);

        // extract directory name from base path
        if (sourcePath.endsWith(Path.sep)) {
            // for directory paths, strip trailing /
            sourcePath = sourcePath.substring(0, sourcePath.length - 1);
        } else {
            // for file paths, strip filename
            sourcePath = Path.dirname(sourcePath);
        }

        // generate path
        targetPath = Path.join(sourcePath, targetPath);
    }

    // normalize path
    return Path.normalize(targetPath);
}

/**
 * Computes the relative resource path from sourceResPath to targetResPath.
 * Both parameters will be normalized and path separators will be converted the local platform.
 * If sourceResPath points to a directory, then it MUST end with a path separator.
 * Otherwise, it will be treated as a path to a file.
 * When sourceResPath points to a file, then {@link Path.dirname} is used to extract the folder name.
 *
 * @param sourceResPath Path to the source resource
 * @param targetResPath Path to the target resource
 * @returns Relative path from sourcePath to targetPath
 */
export function computeRelativeResPath(sourceResPath: string, targetResPath: string): string {
    sourceResPath = fixPathSeparators(sourceResPath);
    targetResPath = fixPathSeparators(targetResPath);

    sourceResPath = Path.normalize(sourceResPath);
    targetResPath = Path.normalize(targetResPath);

    if (!sourceResPath.endsWith(Path.sep)) {
        sourceResPath = Path.dirname(sourceResPath);
    }

    return Path.relative(sourceResPath, targetResPath);
}
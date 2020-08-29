import {
    HtmlCompilerContext,
    HtmlCompilerModule
} from '../htmlCompiler';
import {
    AnchorNodeResolve,
    CompiledAnchorNode,
    FragmentContext
} from '../../..';
import Path
    from 'path';

/**
 * Compiles anchor tags (<a>)
 */
export class AnchorModule implements HtmlCompilerModule {
    enterNode(htmlContext: HtmlCompilerContext): void {
        // if this is an anchor node, then compile it
        if (CompiledAnchorNode.isCompiledAnchorNode(htmlContext.node)) {
            compileAnchorNode(htmlContext.node, htmlContext);
        }
    }
}

/**
 * Compile a {@link CompiledAnchorNode}.
 *
 * @param anchorNode Node to compiled
 * @param htmlContext Current context
 */
export function compileAnchorNode(anchorNode: CompiledAnchorNode, htmlContext: HtmlCompilerContext): void {
    // resolve href
    anchorNode.href = resolveAnchorHref(anchorNode.href, anchorNode.resolve, htmlContext.sharedContext.pipelineContext.fragmentContext);

    // replace with uncompiled
    const uncompiledAnchor = anchorNode.toUncompiled();
    anchorNode.replaceSelf([ uncompiledAnchor ]);
    htmlContext.setDeleted();
}

/**
 * Compute the final value of the "href" attribute given a context and resolve mode.
 * @param href Original "href" value
 * @param resolve Resolve mode to use
 * @param fragmentContext Context of the current fragment
 * @return The final "href" value
 */
export function resolveAnchorHref(href: string, resolve: AnchorNodeResolve, fragmentContext: FragmentContext): string {
    switch (resolve) {
        // process ROOT resolve
        case AnchorNodeResolve.ROOT:
            return resolveAnchorHrefRoot(href, fragmentContext);

        // process LOCAL resolve
        case AnchorNodeResolve.LOCAL:
            return resolveAnchorHrefLocal(href, fragmentContext);

        case AnchorNodeResolve.BASE:
            return resolveAnchorHrefBase(href, fragmentContext);

        // no-op for NONE
        case AnchorNodeResolve.NONE:
            return href;

        default:
            throw new Error(`Invalid value for AnchorNodeResolve: "${ resolve }"`);
    }
}

/**
 * Resolve the value of the "href" attribute relative to the root fragment.
 * See {@link AnchorNodeResolve} for more details.
 * @param href Original href value
 * @param fragmentContext Context of the current fragment.
 * @return The final href value
 */
export function resolveAnchorHrefRoot(href: string, fragmentContext: FragmentContext): string {
    // get path to root fragment
    const rootFragmentPath = findRootPath(fragmentContext);

    // extract directory name
    const rootFragmentDir = Path.dirname(rootFragmentPath);

    // combine with href
    return `${ rootFragmentDir }${ Path.sep }${ href }`;
}

/**
 * Resolve the value of the "href" attribute relative to the current fragment.
 * See {@link AnchorNodeResolve} for more details.
 * @param href Original href value
 * @param fragmentContext Context of the current fragment.
 * @return The final href value
 */
export function resolveAnchorHrefLocal(href: string, fragmentContext: FragmentContext): string {
    // get path to current fragment
    const fragmentPath = fragmentContext.path;

    // extract directory name
    const fragmentDir = Path.dirname(fragmentPath);

    // combine with href
    return `${ fragmentDir }${ Path.sep }${ href }`;
}

/**
 * Resolve the value of the "href" attribute relative to the project base path.
 * See {@link AnchorNodeResolve} for more details.
 * @param href Original href value
 * @param fragmentContext Context of the current fragment.
 * @return The final href value
 */
export function resolveAnchorHrefBase(href: string, fragmentContext: FragmentContext): string {
    // get path to root fragment
    const rootFragmentPath = findRootPath(fragmentContext);

    // extract directory name
    const rootFragmentDir = Path.dirname(rootFragmentPath);

    // TODO maybe extract?
    // flatten directory (remove ../)
    const flattenedDir = rootFragmentDir.replace(/([^/\\\s]+[/\\]|^)\.\.[/\\]/g, '');

    // TODO maybe extract?
    // invert directory
    const invertedDir = flattenedDir.replace(/[^/\\]+/g, '..');

    // TODO maybe extract?
    // trim trailing /
    const trimmedDir = invertedDir.replace(/[/\\]$/, '');

    // combine with href
    return `${ trimmedDir }${ Path.sep }${ href }`;
}

/**
 * Finds the path to the root fragment.
 * @param fragmentContext Current fragment to start searching from
 * @return the path to the
 */
export function findRootPath(fragmentContext: FragmentContext): string {
    // find the root context
    while (fragmentContext.parentContext !== undefined) {
        fragmentContext = fragmentContext.parentContext;
    }

    // get the path
    return fragmentContext.path;
}
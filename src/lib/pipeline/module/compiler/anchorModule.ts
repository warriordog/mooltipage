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
    // extract directory name
    const rootFragmentDir = Path.dirname(fragmentContext.rootResPath);

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
    const fragmentPath = fragmentContext.fragmentResPath;

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
    // extract directory name
    const rootFragmentDir = Path.dirname(fragmentContext.rootResPath);

    // normalize and flatten directory (remove ../ and ./)
    const normalizedDir = Path.normalize(rootFragmentDir);
    const flattenedDir = normalizedDir.replace(/^\.([/\\]|$)/, '');

    // if the base path is the root, then just use href as is
    if (flattenedDir === '') {
        return href;
    }

    // invert directory
    const invertedDir = flattenedDir.replace(/[^/\\]+/g, '..');

    // trim trailing /
    const trimmedDir = invertedDir.replace(/[/\\]$/, '');

    // combine with href
    return `${ trimmedDir }/${ href }`;
}
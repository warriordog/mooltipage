import { DocumentNode } from '..';

/**
 * Compiles inputs from the project source into plain web resources
 */
export interface Pipeline {

    /**
     * Page <-> resource dependency tracker.
     * Tracks all dependencies between pages and other pipeline resources.
     */
    readonly dependencyTracker: DependencyTracker;

    /**
     * Compiles a page from start to finish.
     * This entry point should be used with the source HTML is intended to be used as a full HTML page.
     * 
     * @param resPath Path to the page, relative to both source and destination.
     * @returns a Page containing the DOM and serialized / formatted HTML
     */
    compilePage(resPath: string): Page;

    /**
     * Compiles a fragment.
     * This entry point should be used if the source HTML does not represent a complete page, or if further processing is to be done.
     * 
     * @param resPath Path to fragment source
     * @param fragmentContext Data related to the specific usage context of this fragment
     * @returns Fragment instance
     */
    compileFragment(resPath: string, fragmentContext?: FragmentContext): Fragment;

    /**
     * Resets the pipeline to its initial state.
     */
    reset(): void;
}

/**
 * Usage data for the current fragment
 */
export interface FragmentContext {
    /**
     * Slot contents for the current fragment
     */
    readonly slotContents: ReadonlyMap<string, DocumentNode>;

    /**
     * Fragment-global scope.
     * Is read-only.
     * Contains mapped fragment params, if applicable.
     */
    readonly scope: ScopeData;

    /**
     * Path that was used to access this fragment.
     * This path may not reflect the actual file where this fragment will end up.
     * If that path is needed, then see {@link rootResPath}.
     */
    readonly fragmentResPath: string;

    /**
     * Path to the "root" fragment or page.
     * This is the path to the actual file that will be produced in the compilation output.
     * This path may not point to the current fragment being compiled, if this fragment is included as a reference.
     * If that path is needed, then see {@link fragmentResPath}.
     */
    readonly rootResPath: string;
}

/**
 * Base unit of work for HTML compilation
 */
export interface Fragment {
    /**
     * Path to fragment, relative to source
     */
    readonly path: string;

    /**
     * Fragment Document Object Model
     */
    readonly dom: DocumentNode;
}

/**
 * Special type of fragment that represents a fully compiled HTML page
 */
export interface Page extends Fragment {
    /**
     * Serialized and formatted HTML representation of the page
     */
    readonly html: string;
}

/**
 * Type of key for scope data
 */
export type ScopeKey = string | number;

/**
 * Local scope data
 */
export type ScopeData = Record<ScopeKey, unknown>;

/**
 * Provides HTML formatting support to the pipeline.
 */
export interface HtmlFormatter {
    /**
     * Formats a DOM tree before serialization.
     * Optional.
     * 
     * @param dom DOM tree to format
     */
    formatDom(dom: DocumentNode): void;

    /**
     * Formats serialized HTML before being exported from the pipeline.
     * Optional.
     * 
     * @param html HTML to format.
     */
    formatHtml(html: string): string;
}

/**
 * Common MIME types
 */
export enum MimeType {
    /**
     * HTML resource
     */
    HTML = 'text/html',

    /**
     * CSS resource
     */
    CSS = 'text/css',

    /**
     * JavaScript resource
     */
    JAVASCRIPT = 'text/javascript',

    /**
     * JSON resource
     */
    JSON = 'application/json', // eslint-disable-line no-shadow

    /**
     * Plain text resource
     */
    TEXT = 'text/plain'
}

/**
 * Pipeline module that tracks dependencies between pages and other resources.
 * A dependency is anything that can affect the compiled output of a page.
 * Provides a two-way mapping that allows listing all the resources dependencies of a page as well as all of the pages that depend on a particular resource.
 */
export interface DependencyTracker {
    /**
     * Gets a list of dependencies for a page
     * @param pageResPath Path to the page
     * @returns Set of paths to all unique resources that this page depends on. Will be empty for an unknown page
     */
    getDependenciesForPage(pageResPath: string): Set<string>;

    /**
     * Gets a list of pages that depend on a resource
     * @param resPath Path to the resource
     * @returns Set of paths to all unique pages that depend on this resource. Will be empty for an unknown resource
     */
    getDependentsForResource(resPath: string): Set<string>;

    /**
     * Checks if a page has been tracked for dependencies
     * @param pageResPath Path to the page
     * @returns true if the page has been tracked, even if it has no dependencies. Returns false otherwise.
     */
    hasTrackedPage(pageResPath: string): boolean;

    /**
     * Checks if a resource was identified as a dependency of any tracked page
     * @param resPath Path to the resource
     * @returns true if the resource is a dependency of any tracked page. Returns false otherwise.
     */
    hasTrackedResource(resPath: string): boolean;
}
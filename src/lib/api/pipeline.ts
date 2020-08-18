import { DocumentNode } from '..';

/**
 * Compiles inputs from the project source into plain web resources
 */
export interface Pipeline {
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
 * Provides file I/O support to the pipeline
 */
export interface PipelineInterface {
    /**
     * Writes a resource of a specified type to the pipeline output.
     * This resource must exist in the pipeline source, for incidentally created resources use createResource()
     * 
     * @param type Type of resource
     * @param resPath Relative path to resource (source and destination) 
     * @param contents File contents as a UTF-8 string
     */
    writeResource(type: MimeType, resPath: string, contents: string): void;

    /**
     * Reads a resource of a specified type from the pipeline input.
     * 
     * @param type Type of resource
     * @param resPath Relative path to resource (source and destination)
     * @returns text content of resource
     */
    getResource(type: MimeType, resPath: string): string;

    /**
     * Creates a new output resource and generates a resource path to reference it
     * This should be used for all incidentally created resources, such as external stylesheets.
     * 
     * @param type MIME type of the new resource
     * @param contents File contents
     * @param sourceResPath Resource path of the resource that spawned this resource
     * @returns path to resource
     */
    createResource(type: MimeType, contents: string, sourceResPath: string): string;

    /**
     * Called when the pipeline is about to reuse a path that was created by a former call to createResource().
     * The pipeline does not check type or sourceResPath, so if these values are significant to the
     *  generated resPath then this method can be overridden to copy, modify, or even create a new
     *  resource.
     * 
     * This method is optional and can be left undefined if not needed.
     * 
     * @param type MIME type of the new resource
     * @param contents File contents
     * @param sourceResPath Resource path of the resource that spawned this resource
     * @param originalResPath The resource path that was produced by the call to createResource()
     * @returns new path to resource, or original if no changes are needed
     */
    reLinkCreatedResource?(type: MimeType, contents: string, sourceResPath: string, originalResPath: string): string;
}

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
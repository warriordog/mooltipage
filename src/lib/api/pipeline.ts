import {
    DocumentNode,
    PipelineCache
} from '..';

/**
 * Compiles inputs from the project source into plain web resources
 */
export interface Pipeline {
    /**
     * Caches reusable data for the pipeline
     */
    readonly cache: PipelineCache;

    /**
     * Frontend / Backend for the pipeline
     */
    readonly pipelineIO: PipelineIO;

    /**
     * HTML formatter, if provided
     */
    readonly htmlFormatter: HtmlFormatter;

    /**
     * Compiles a page from start to finish.
     * This entry point should be used with the source HTML is intended to be used as a full HTML page.
     * 
     * @param resPath Path to the page, relative to both source and destination.
     * @returns a Page containing the DOM and serialized / formatted HTML
     */
    compilePage(resPath: string): Promise<Page>;

    /**
     * Compiles a fragment.
     * This entry point should be used if the source HTML does not represent a complete page, or if further processing is to be done.
     * 
     * @param resPath Path to fragment source
     * @param fragmentContext Data related to the specific usage context of this fragment
     * @returns Fragment instance
     */
    compileFragment(resPath: string, fragmentContext?: FragmentContext): Promise<Fragment>;

    /**
     * Resets the pipeline to its initial state.
     */
    reset(): void;
}


/**
 * State data for the current unit of compilation in the pipeline
 */
export interface PipelineContext {
    /**
     * Current pipeline instance
     */
    readonly pipeline: Pipeline;

    /**
     * Fragment that is currently being compiled
     */
    readonly fragment: Fragment;

    /**
     * Fragment usage context
     */
    readonly fragmentContext: FragmentContext;
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
     * SCSS (CSS variant) resource
     */
    SCSS = 'text/scss',

    /**
     * SASS (CSS variant) resource
     */
    SASS = 'text/sass',

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
 * Gets the filename extension to use for a specified resource type.
 * Defaults to "dat" for unknown resource types.
 * @param resourceType Resource type to get extension for
 * @returns filename extension, without the dot.
 */
export function getResourceTypeExtension(resourceType: MimeType): string {
    switch (resourceType) {
        case MimeType.HTML: return 'html';
        case MimeType.CSS: return 'css';
        case MimeType.SASS: return 'sass';
        case MimeType.SCSS: return 'scss';
        case MimeType.JAVASCRIPT: return 'js';
        case MimeType.JSON: return 'json';
        case MimeType.TEXT: return 'txt';
        default: return 'dat';
    }
}

/**
 * Provides file I/O support to the pipeline
 */
export interface PipelineIO {
    /**
     * Path to source directory
     */
    readonly sourcePath: string;

    /**
     * Path to destination directory
     */
    readonly destinationPath: string;

    /**
     * Reads a resource of a specified type from the pipeline input.
     * Path will be computed by using resPath relative to {@link sourcePath}.
     * See {@link resolveSourceResource} for details.
     *
     * @param type Type of resource
     * @param resPath Relative path to resource (source and destination)
     * @returns text content of resource
     */
    getResource(type: MimeType, resPath: string): Promise<string>;

    /**
     * Writes a resource of a specified type to the pipeline output.
     * This resource must map directly to a source resource, for generated output use createResource().
     * Path will be computed by using resPath relative to {@link destinationPath}.
     * See {@link resolveDestinationResource} for details.
     *
     * @param type Type of resource
     * @param resPath Relative path to resource (source and destination)
     * @param contents File contents as a UTF-8 string
     */
    writeResource(type: MimeType, resPath: string, contents: string): Promise<void>;

    /**
     * Creates a new output resource and generates a resource path to reference it
     * This should be used for all generated resources, such as external stylesheets.
     * Path will be computed by using resPath relative to {@link destinationPath}.
     * See {@link resolveDestinationResource} for details.
     *
     * @param type MIME type of the new resource
     * @param contents File contents
     * @returns path to resource
     */
    createResource(type: MimeType, contents: string): Promise<string>;

    /**
     * Gets the absolute path to a resource in {@link sourcePath}.
     * @param resPath Raw path to resource
     * @returns Real path to resource
     */
    resolveSourceResource(resPath: string): string;

    /**
     * Gets the absolute path to a resource in {@link destinationPath}.
     * @param resPath Raw path to resource
     * @returns Real path to resource
     */
    resolveDestinationResource(resPath: string): string;

    /**
     * Generates a unique resource path in {@link destinationPath} that can be used for a generated resource.
     * This method does not create the file, only reserves the path.
     * @param type MIME type of the resource to create
     * @param contents Contents of the file
     * @returns returns a unique resource path that is acceptable for the specified MIME type
     */
    createResPath(type: MimeType, contents: string): string;

    /**
     * Computes the relative path from {@link sourcePath} to rawResPath.
     * @param rawResPath Target path
     * @returns returns the relative path to {@link sourcePath}.
     */
    getSourceResPathForAbsolutePath(rawResPath: string): string;

    /**
     * Computes the relative path from {@link destinationPath} to rawResPath.
     * @param rawResPath Target path
     * @returns returns the relative path to {@link destinationPath}.
     */
    getDestinationResPathForAbsolutePath(rawResPath: string): string;
}

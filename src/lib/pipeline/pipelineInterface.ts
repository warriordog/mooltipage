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
    writeResource(type: ResourceType, resPath: string, contents: string): void;

    /**
     * Reads a resource of a specified type from the pipeline input.
     * 
     * @param type Type of resource
     * @param resPath Relative path to resource (source and destination)
     */
    getResource(type: ResourceType, resPath: string): string;

    /**
     * Creates a new output resource and generates a resource path to reference it
     * This should be used for all incidentally created resources, such as external stylesheets.
     * 
     * @param type MIME type of the new resource
     * @param contents File contents
     * @param sourceResPath Resource path of the resource that spawned this resource
     */
    createResource(type: ResourceType, contents: string, sourceResPath: string): string;

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
     */
    reLinkCreatedResource?(type: ResourceType, contents: string, sourceResPath: string, originalResPath: string): string;
}

export enum ResourceType {
    HTML = 'text/html',
    CSS = 'text/css',
    JAVASCRIPT = 'text/javascript',
    JSON = 'application/json',
    TEXT = 'text/plain'
}

export function getResourceTypeExtension(resourceType: ResourceType): string {
    switch(resourceType) {
        case ResourceType.HTML: return 'html'
        case ResourceType.CSS: return 'css'
        case ResourceType.JAVASCRIPT: return 'js'
        case ResourceType.JSON: return 'json'
        case ResourceType.TEXT: return 'txt'
        default: return 'dat'
    }
}
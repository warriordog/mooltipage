export interface PipelineInterface {
    writeResource(type: ResourceType, resId: string, contents: string): void;
    getResource(type: ResourceType, resId: string): string;

    /**
     * Creates a new output resource and generates a resource ID to reference it
     * @param type MIME type of the new resource
     * @param contents File contents
     * @param sourceResId Resource ID of the resource that spawned this resource
     */
    createResource(type: ResourceType, contents: string, sourceResId: string): string;
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
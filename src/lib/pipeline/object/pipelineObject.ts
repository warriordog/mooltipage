/**
 * A top-level object that can be processed by the pipeline.
 */
export interface PipelineObject {
    /**
     * Unique identifier for this object.  Should be treated as opaque.
     * Meaning is dependedent on pipline interface implementation.
     */
    readonly resId: string;

    /**
     * Clones this pipeline object.
     * 
     * @returns A clone of this object
     */
    clone(): PipelineObject;
}
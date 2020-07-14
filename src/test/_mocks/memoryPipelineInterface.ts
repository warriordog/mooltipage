import { PipelineInterface, ResourceType } from '../../lib/pipeline/pipelineInterface';

export class MemoryPipelineInterface implements PipelineInterface {
    sourceContent: Map<string, TestResource> = new Map();
    destContent: Map<string, TestResource> = new Map();
    createdContent: Map<string, TestResource> = new Map();
    private nextCreatedContentId = 0;

    clear(): void {
        this.sourceContent = new Map();
        this.destContent = new Map();
        this.createdContent = new Map();
        this.nextCreatedContentId = 0;
    }

    setSource(resId: string, res: TestResource): void {
        this.sourceContent.set(resId, res);
    }
    setSourceHtml(resId: string, html: string): void {
        this.setSource(resId, {
            content: html,
            type: ResourceType.HTML
        });
    }
    hasSource(resId: string): boolean {
        return this.sourceContent.has(resId);
    }
    getSource(resId: string): TestResource | undefined {
        return this.sourceContent.get(resId);
    }
    getSourceValue(resId: string): string | undefined {
        return this.getSource(resId)?.content;
    }


    setDestination(resId: string, res: TestResource): void {
        this.destContent.set(resId, res);
    }
    setDestinationHtml(resId: string, html: string): void {
        this.setDestination(resId, {
            content: html,
            type: ResourceType.HTML
        });
    }
    hasDestination(resId: string): boolean {
        return this.destContent.has(resId);
    }
    getDestination(resId: string): TestResource | undefined {
        return this.destContent.get(resId);
    }
    getDestinationValue(resId: string): string | undefined {
        return this.getDestination(resId)?.content;
    }

    setCreated(resId: string, res: TestResource): void {
        this.createdContent.set(resId, res);
    }
    setCreatedHtml(resId: string, html: string): void {
        this.setCreated(resId, {
            content: html,
            type: ResourceType.HTML
        });
    }
    hasCreated(resId: string): boolean {
        return this.createdContent.has(resId);
    }
    getCreated(resId: string): TestResource | undefined {
        return this.createdContent.get(resId);
    }
    getCreatedValue(resId: string): string | undefined {
        return this.getCreated(resId)?.content;
    }

    getResource(type: ResourceType, resId: string): string {
        if (this.sourceContent.has(resId)) {
            const resource = this.sourceContent.get(resId);

            if (resource == undefined) {
                throw new Error(`Stored HTML for resource ${resId} is undefined`);
            }

            return resource.content;
        } else {
            throw new Error(`Unable to resolve HTML resource ${resId}`);
        }
    }

    writeResource(type: ResourceType, resId: string, content: string): void {
       this.destContent.set(resId, {
           content: content,
           type: type
       });
    }

    createResource(type: ResourceType, contents: string): string {
        const resId = String(this.nextCreatedContentId);
        this.nextCreatedContentId++;

        this.createdContent.set(resId, {
            content: contents,
            type: type
        });

        return resId;
    }
}

export interface TestResource {
    content: string,
    type: ResourceType
}
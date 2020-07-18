import { PipelineInterface, ResourceType } from '../../lib';

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

    setSource(resPath: string, res: TestResource): void {
        this.sourceContent.set(resPath, res);
    }
    setSourceHtml(resPath: string, html: string): void {
        this.setSource(resPath, {
            content: html,
            type: ResourceType.HTML
        });
    }
    hasSource(resPath: string): boolean {
        return this.sourceContent.has(resPath);
    }
    getSource(resPath: string): TestResource | undefined {
        return this.sourceContent.get(resPath);
    }
    getSourceValue(resPath: string): string | undefined {
        return this.getSource(resPath)?.content;
    }


    setDestination(resPath: string, res: TestResource): void {
        this.destContent.set(resPath, res);
    }
    setDestinationHtml(resPath: string, html: string): void {
        this.setDestination(resPath, {
            content: html,
            type: ResourceType.HTML
        });
    }
    hasDestination(resPath: string): boolean {
        return this.destContent.has(resPath);
    }
    getDestination(resPath: string): TestResource | undefined {
        return this.destContent.get(resPath);
    }
    getDestinationValue(resPath: string): string | undefined {
        return this.getDestination(resPath)?.content;
    }

    setCreated(resPath: string, res: TestResource): void {
        this.createdContent.set(resPath, res);
    }
    setCreatedHtml(resPath: string, html: string): void {
        this.setCreated(resPath, {
            content: html,
            type: ResourceType.HTML
        });
    }
    hasCreated(resPath: string): boolean {
        return this.createdContent.has(resPath);
    }
    getCreated(resPath: string): TestResource | undefined {
        return this.createdContent.get(resPath);
    }
    getCreatedValue(resPath: string): string | undefined {
        return this.getCreated(resPath)?.content;
    }

    getResource(type: ResourceType, resPath: string): string {
        if (this.sourceContent.has(resPath)) {
            const resource = this.sourceContent.get(resPath);

            if (resource == undefined) {
                throw new Error(`Stored HTML for resource ${resPath} is undefined`);
            }

            return resource.content;
        } else {
            throw new Error(`Unable to resolve HTML resource ${resPath}`);
        }
    }

    writeResource(type: ResourceType, resPath: string, content: string): void {
       this.destContent.set(resPath, {
           content: content,
           type: type
       });
    }

    createResource(type: ResourceType, contents: string): string {
        const resPath = String(this.nextCreatedContentId);
        this.nextCreatedContentId++;

        this.createdContent.set(resPath, {
            content: contents,
            type: type
        });

        return resPath;
    }
}

export interface TestResource {
    content: string,
    type: ResourceType
}
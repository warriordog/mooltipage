import { PipelineInterface, MimeType } from '../../lib';

export class MemoryPipelineInterface implements PipelineInterface {
    sourceContent: Map<string, TestResource> = new Map<string, TestResource>();
    destContent: Map<string, TestResource> = new Map<string, TestResource>();
    createdContent: Map<string, TestResource> = new Map<string, TestResource>();
    private nextCreatedContentId = 0;

    reset(): void {
        this.sourceContent = new Map<string, TestResource>();
        this.destContent = new Map<string, TestResource>();
        this.createdContent = new Map<string, TestResource>();
        this.nextCreatedContentId = 0;
    }

    setSource(resPath: string, res: TestResource): void {
        this.sourceContent.set(resPath, res);
    }
    setSourceHtml(resPath: string, html: string): void {
        this.setSource(resPath, {
            content: html,
            type: MimeType.HTML
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
            type: MimeType.HTML
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
            type: MimeType.HTML
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

    getResource(type: MimeType, resPath: string): string {
        // generate list of "similar" paths to try - necessary since real FS will resolve the path first
        const testPaths = [ resPath ];
        if (resPath.startsWith('./')) {
            // remove leading ./
            testPaths.push(resPath.substring(2, resPath.length));
        } else {
            // add leading ./
            testPaths.push(`./${ resPath }`);
        }

        for (const testPath of testPaths) {
            if (this.sourceContent.has(testPath)) {
                const resource = this.sourceContent.get(testPath);

                if (resource == undefined) {
                    throw new Error(`Stored HTML for resource "${ resPath }" is undefined`);
                }

                return resource.content;
            }
        }

        throw new Error(`Unable to resolve HTML resource "${ resPath }"`);
    }

    writeResource(type: MimeType, resPath: string, content: string): void {
       this.destContent.set(resPath, {
           content: content,
           type: type
       });
    }

    createResource(type: MimeType, contents: string): string {
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
    content: string;
    type: MimeType;
}
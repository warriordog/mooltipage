import { MimeType } from '../../lib';
import * as Path
    from 'path';
import {
    PipelineIOImpl
} from '../../lib/pipeline/standardPipeline';
import {fixPathSeparators} from '../../lib/fs/pathUtils';

export class MemoryPipelineInterface extends PipelineIOImpl {
    sourceContent: Map<string, TestResource> = new Map<string, TestResource>();
    destContent: Map<string, TestResource> = new Map<string, TestResource>();
    createdContent: Map<string, TestResource> = new Map<string, TestResource>();
    private nextCreatedContentId = 0;

    constructor() {
        super('', '');
    }

    reset(): void {
        this.sourceContent = new Map<string, TestResource>();
        this.destContent = new Map<string, TestResource>();
        this.createdContent = new Map<string, TestResource>();
        this.nextCreatedContentId = 0;
    }

    setSource(resPath: string, res: TestResource): void {
        this.sourceContent.set(normalizeResPath(resPath), res);
    }
    setSourceHtml(resPath: string, html: string): void {
        this.setSource(resPath, {
            content: html,
            type: MimeType.HTML
        });
    }
    hasSource(resPath: string): boolean {
        return this.sourceContent.has(normalizeResPath(resPath));
    }
    getSource(resPath: string): TestResource | undefined {
        return this.sourceContent.get(normalizeResPath(resPath));
    }
    getSourceValue(resPath: string): string | undefined {
        return this.getSource(normalizeResPath(resPath))?.content;
    }


    setDestination(resPath: string, res: TestResource): void {
        this.destContent.set(normalizeResPath(resPath), res);
    }
    setDestinationHtml(resPath: string, html: string): void {
        this.setDestination(normalizeResPath(resPath), {
            content: html,
            type: MimeType.HTML
        });
    }
    hasDestination(resPath: string): boolean {
        return this.destContent.has(normalizeResPath(resPath));
    }
    getDestination(resPath: string): TestResource | undefined {
        return this.destContent.get(normalizeResPath(resPath));
    }
    getDestinationValue(resPath: string): string | undefined {
        return this.getDestination(normalizeResPath(resPath))?.content;
    }

    setCreated(resPath: string, res: TestResource): void {
        this.createdContent.set(normalizeResPath(resPath), res);
    }
    setCreatedHtml(resPath: string, html: string): void {
        this.setCreated(resPath, {
            content: html,
            type: MimeType.HTML
        });
    }
    hasCreated(resPath: string): boolean {
        return this.createdContent.has(normalizeResPath(resPath));
    }
    getCreated(resPath: string): TestResource | undefined {
        return this.createdContent.get(normalizeResPath(resPath));
    }
    getCreatedValue(resPath: string): string | undefined {
        return this.getCreated(normalizeResPath(resPath))?.content;
    }

    getResource(type: MimeType, resPath: string): string {
        resPath = normalizeResPath(resPath);

        // generate list of "similar" paths to try - necessary since real FS will resolve the path first
        const testPaths = [resPath];
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

                if (resource === undefined) {
                    throw new Error(`Stored HTML for resource "${ resPath }" is undefined`);
                }

                return resource.content;
            }
        }

        throw new Error(`Unable to resolve HTML resource "${ resPath }"`);
    }

    writeResource(type: MimeType, resPath: string, content: string): void {
        this.destContent.set(normalizeResPath(resPath), {
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

function normalizeResPath(resPath: string): string {
    return Path.normalize(fixPathSeparators(resPath));
}
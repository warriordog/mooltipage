export interface TestSet {
    beforeAll?(): void;
    afterAll?(): void;

    beforeTest?(testName: string): void;
    afterTest?(testName: string): void;

    getTests(): Map<string, TestCallback>;
    
    readonly setName: string;
}

export type TestCallback = () => void;
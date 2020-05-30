import { TestSet } from "./testSet";

export default class TestSetGroup {
    readonly groupName: string;
    private readonly testSets: Array<TestSet>;
    
    constructor(name: string, testSets?: ArrayLike<TestSet>) {
        this.groupName = name;
        this.testSets = testSets != undefined ? Array.from(testSets) : [];
    }

    addTestSets(...sets: Array<TestSet>): void {
        if (sets != null && sets.length > 0) {
            for (const testSet of sets) {
                this.testSets.push(testSet);
            }
        }
    }

    getTestSets(): ReadonlyArray<TestSet> {
        return this.testSets;
    }

    isEmpty(): boolean {
        return this.testSets.length == 0;
    }
}
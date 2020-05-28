import { TestSet, TestCallback } from "./testSet";

export default class TestRunner {
    private readonly testSets: Set<TestSet> = new Set<TestSet>();

    addTestSets(...sets: Array<TestSet>) {
        if (sets != null && sets.length > 0) {
            for (let testSet of sets) {
                this.testSets.add(testSet);
            }
        }
    }

    runAllTests(): void {
        try {
            // make sure we have tests
            if (this.testSets.size > 0) {
                console.log(`Running ${this.testSets.size} test set(s).`);
    
                // run each test set
                for (let testSet of this.testSets) {
                    this.runTestSet(testSet);
                }
            } else {
                console.log('No test sets selected for run.');
            }
        } catch (e) {
            console.error('Internal error while running tests', e);
        }
    }

    private runTestSet(testSet: TestSet): void {
        try {
            // run set init
            if (testSet.beforeAll != undefined) {
                testSet.beforeAll();
            }

            // run each test
            testSet.getTests().forEach((testCallback: TestCallback, testName: string) => {
                this.runTestMethod(testSet, testName, testCallback);
            });

            // run set teardown
            if (testSet.afterAll != undefined) {
                testSet.afterAll();
            }
        } catch (e) {
            console.error(`${testSet.setName}: ERROR`, e);
        }
    }

    private runTestMethod(testSet: TestSet, testName: string, testCallback: TestCallback) {
        try {
            if (testSet.beforeTest != undefined) {
                testSet.beforeTest(testName);
            }

            testCallback();

            if (testSet.afterTest != undefined) {
                testSet.afterTest(testName);
            }

            console.log(`${testSet.setName}/${testName}: PASS`);
        } catch (e) {
            console.log(`${testSet.setName}/${testName}: FAIL`, e);
        }
    }
}
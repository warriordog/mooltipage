import { TestSet, TestCallback } from "./testSet";
import TestSetGroup from './testSetGroup';

export default class TestRunner {
    private readonly testGroups: Array<TestSetGroup> = [];

    addTestSetGroups(...testGroups: Array<TestSetGroup>): void {
        if (testGroups != null && testGroups.length > 0) {
            for (const testGroup of testGroups) {
                this.testGroups.push(testGroup);
            }
        }
    }

    runAllTests(): void {
        try {
            // get non-empty tests
            const nonEmptyGroups = this.testGroups.filter(tg => !tg.isEmpty());

            // make sure we have tests
            if (nonEmptyGroups.length > 0) {
                // run each non-empty group
                for (const testSetGroup of nonEmptyGroups) {

                    // run each test set in the group
                    for (const testSet of testSetGroup.getTestSets()) {
                        // run test set
                        this.runTestSet(testSetGroup, testSet);
                    }
                }
            } else {
                console.log('No test sets selected for run.');
            }
        } catch (e) {
            console.error('Internal error while running tests', e);
        }
    }

    private runTestSet(testSetGroup: TestSetGroup, testSet: TestSet): void {
        try {
            // run set init
            if (testSet.beforeAll != undefined) {
                testSet.beforeAll();
            }

            // run each test
            testSet.getTests().forEach((testCallback: TestCallback, testName: string) => {
                this.runTestMethod(testSetGroup, testSet, testName, testCallback);
            });

            // run set teardown
            if (testSet.afterAll != undefined) {
                testSet.afterAll();
            }
        } catch (e) {
            console.error(`${testSetGroup.groupName} / ${testSet.setName} : ERROR`, e);
        }
    }

    private runTestMethod(testSetGroup: TestSetGroup, testSet: TestSet, testName: string, testCallback: TestCallback) {
        try {
            if (testSet.beforeTest != undefined) {
                testSet.beforeTest(testName);
            }

            testCallback();

            if (testSet.afterTest != undefined) {
                testSet.afterTest(testName);
            }

            console.log(`${testSetGroup.groupName} / ${testSet.setName} / ${testName} : PASS`);
        } catch (e) {
            console.log(`${testSetGroup.groupName} / ${testSet.setName} / ${testName} : FAIL`, e);
        }
    }
}
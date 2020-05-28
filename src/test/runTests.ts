import { TestSet, TestCallback } from './framework/testSet';

import BasicHtmlTest from './endToEnd/basicHtmlTest';

const testSets: Array<TestSet> = [
    new BasicHtmlTest()
];

console.log(`Running ${testSets.length} test set(s).`);
for (let testSet of testSets) {
    const testSetName: string = testSet.getName();

    try {    
        if (testSet.beforeAll != undefined) {
            testSet.beforeAll();
        }

        testSet.getTests().forEach((testCallback: TestCallback, testName: string) => {
            try {
                if (testSet.beforeTest != undefined) {
                    testSet.beforeTest(testName);
                }

                testCallback();

                if (testSet.afterTest != undefined) {
                    testSet.afterTest(testName);
                }

                console.log(`${testSetName}/${testName}: PASS`);
            } catch (e) {
                console.log(`${testSetName}/${testName}: FAIL`, e);
            }
        });
        if (testSet.afterAll != undefined) {
            testSet.afterAll();
        }
    } catch (e) {
        console.error(`Error running set '${testSetName}`, e);
    }
}
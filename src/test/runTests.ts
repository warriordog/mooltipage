import TestRunner from './framework/testRunner';

import BasicHtmlTest from './endToEnd/basicHtmlTest';

// create test runner instance
const testRunner: TestRunner = new TestRunner();

// add test sets
testRunner.addTestSets(
    new BasicHtmlTest()
);

// Run tests
testRunner.runAllTests();

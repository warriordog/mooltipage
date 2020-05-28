import TestRunner from './framework/testRunner';

import BasicHtmlTest from './endToEnd/basicHtmlTests';
import FragmentOnlyTests from './endToEnd/fragmentOnlyTests';

// create test runner instance
const testRunner: TestRunner = new TestRunner();

// add test sets
testRunner.addTestSets(
    new BasicHtmlTest(),
    new FragmentOnlyTests()
);

// Run tests
testRunner.runAllTests();

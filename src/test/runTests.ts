import TestRunner from './framework/testRunner';

import BasicHtmlTest from './endToEnd/basicHtmlTests';
import FragmentOnlyTests from './endToEnd/fragmentOnlyTests';
import FragmentSlotTests from './endToEnd/fragmentSlotTests';
import CliArgsTests from './unit/cliArgsTests';

// create test runner instance
const testRunner: TestRunner = new TestRunner();

// add test sets
testRunner.addTestSets(
    new BasicHtmlTest(),
    new FragmentOnlyTests(),
    new FragmentSlotTests(),
    new CliArgsTests()
);

// Run tests
testRunner.runAllTests();

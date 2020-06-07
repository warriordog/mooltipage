import { TestRunner } from './framework/testRunner';

import { BasicHtmlTests } from './endToEnd/basicHtmlTests';
import { FragmentOnlyTests } from './endToEnd/fragmentOnlyTests';
import { FragmentSlotTests } from './endToEnd/fragmentSlotTests';
import { CliArgsTests } from './unit/cliArgsTests';
import { TestSetGroup } from './framework/testSetGroup';
import { PipelineCacheTests } from './unit/pipelineCacheTests';
import { UsageContextTests } from './unit/usageContextTests';
import { NodeConstructorTests } from './unit/nodeConstructorTests';
import { NodeIsTypeTests } from './unit/nodeIsTypeTests';
import { TemplateTextTests } from './endToEnd/templateTextTests';

// create test runner instance
const testRunner: TestRunner = new TestRunner();

// add test sets
testRunner.addTestSetGroups(
    // Unit tests first
    new TestSetGroup('unit', [
        new PipelineCacheTests(),
        new UsageContextTests(),
        new CliArgsTests(),
        new NodeConstructorTests(),
        new NodeIsTypeTests()
    ]),

    // integration tests second
    new TestSetGroup('integration'),

    // end-to-end tests last
    new TestSetGroup('endToEnd', [
        new BasicHtmlTests(),
        new FragmentOnlyTests(),
        new FragmentSlotTests(),
        new TemplateTextTests()
    ])
);

// Run tests
testRunner.runAllTests();

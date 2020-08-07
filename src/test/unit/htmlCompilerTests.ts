import test from 'ava';
import {convertAttributeNameToScopeName} from '../../lib/pipeline/module/htmlCompiler';

test('HtmlCompiler.convertAttributeNameToScopeName() preserves all lowercase names', t => {
    t.is(convertAttributeNameToScopeName('lower'), 'lower');
});

test('HtmlCompiler.convertAttributeNameToScopeName() converts snake case', t => {
    t.is(convertAttributeNameToScopeName('snake-case'), 'snakeCase');
    t.is(convertAttributeNameToScopeName('var-name'), 'varName');
});

test('HtmlCompiler.convertAttributeNameToScopeName() converts snake case with multiple hyphens', t => {
    t.is(convertAttributeNameToScopeName('snake-case-name'), 'snakeCaseName');
    t.is(convertAttributeNameToScopeName('this-is-a-very-long-name'), 'thisIsAVeryLongName');
});

test('HtmlCompiler.convertAttributeNameToScopeName() supports hyphen followed by a number', t => {
    t.is(convertAttributeNameToScopeName('var-1'), 'var1');
    t.is(convertAttributeNameToScopeName('this-is-a-number-2'), 'thisIsANumber2');
});

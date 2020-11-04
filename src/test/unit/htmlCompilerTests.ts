import test from 'ava';
import {convertSnakeCaseToCamelCase} from '../../lib/util/caseUtils';

test('HtmlCompiler.convertAttributeNameToScopeName() preserves all lowercase names', t => {
    t.is(convertSnakeCaseToCamelCase('lower'), 'lower');
});

test('HtmlCompiler.convertAttributeNameToScopeName() converts snake case', t => {
    t.is(convertSnakeCaseToCamelCase('snake-case'), 'snakeCase');
    t.is(convertSnakeCaseToCamelCase('var-name'), 'varName');
});

test('HtmlCompiler.convertAttributeNameToScopeName() converts snake case with multiple hyphens', t => {
    t.is(convertSnakeCaseToCamelCase('snake-case-name'), 'snakeCaseName');
    t.is(convertSnakeCaseToCamelCase('this-is-a-very-long-name'), 'thisIsAVeryLongName');
});

test('HtmlCompiler.convertAttributeNameToScopeName() supports hyphen followed by a number', t => {
    t.is(convertSnakeCaseToCamelCase('var-1'), 'var1');
    t.is(convertSnakeCaseToCamelCase('this-is-a-number-2'), 'thisIsANumber2');
});

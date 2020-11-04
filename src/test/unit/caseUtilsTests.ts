import test from 'ava';
import {
    convertCamelCaseToSnakeCase,
    convertSnakeCaseToCamelCase
} from '../../lib/util/caseUtils';

test('convertSnakeCaseToCamelCase() ignores basic strings', t => {
    t.is(convertSnakeCaseToCamelCase('string'), 'string');
});
test('convertSnakeCaseToCamelCase() ignores camelCase strings', t => {
    t.is(convertSnakeCaseToCamelCase('camelCaseString'), 'camelCaseString');
});
test('convertSnakeCaseToCamelCase() converts snake-case strings', t => {
    t.is(convertSnakeCaseToCamelCase('snake-case-string'), 'snakeCaseString');
});
test('convertSnakeCaseToCamelCase() handles numbers', t => {
    t.is(convertSnakeCaseToCamelCase('basic1'), 'basic1');
    t.is(convertSnakeCaseToCamelCase('camelCase1'), 'camelCase1');
    t.is(convertSnakeCaseToCamelCase('snake-case-1'), 'snakeCase1');
    t.is(convertSnakeCaseToCamelCase('snake-case2'), 'snakeCase2');
    t.is(convertSnakeCaseToCamelCase('snake-case3-string'), 'snakeCase3String');
});

test('convertCamelCaseToSnakeCase() ignores basic strings', t => {
    t.is(convertCamelCaseToSnakeCase('string'), 'string');
});
test('convertCamelCaseToSnakeCase() ignores snake-case strings', t => {
    t.is(convertCamelCaseToSnakeCase('snake-case-string'), 'snake-case-string');
});
test('convertCamelCaseToSnakeCase() converts camelCase strings', t => {
    t.is(convertCamelCaseToSnakeCase('camelCaseString'), 'camel-case-string');
});
test('convertCamelCaseToSnakeCase() handles numbers', t => {
    t.is(convertCamelCaseToSnakeCase('string1'), 'string1');
    t.is(convertCamelCaseToSnakeCase('snake-case-1'), 'snake-case-1');
    t.is(convertCamelCaseToSnakeCase('camelCase1'), 'camel-case1');
    t.is(convertCamelCaseToSnakeCase('camelCase2String'), 'camel-case2-string');
});
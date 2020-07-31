import test from 'ava';
import { isExpressionString, parseExpression } from '../../lib';

test('[unit] ExpressionCompiler recognises template text', t => {
    t.true(isExpressionString('${ "foo" }'));
    t.true(isExpressionString('${ 1 }'));
    t.true(isExpressionString('${ "a" + "b" }'));
    t.true(isExpressionString('Hello${ ", " }World!'));
    t.true(isExpressionString('${ "foo" } ${ "bar" } ${ "baz" }'));

    t.false(isExpressionString('\\${ "foo" }'));
    t.false(isExpressionString('$ { "foo" }'));
    t.false(isExpressionString('${ '));
});

test('[unit] ExpressionCompiler recognises handlebars', t => {
    t.true(isExpressionString('{{ "foo" }}'));
    t.true(isExpressionString('{{ 1 }}'));
    t.true(isExpressionString('{{ "a" + "b" }}'));

    t.false(isExpressionString('Hello{{ ", " }}World!'));
    t.false(isExpressionString('\\{{ "foo" }}'));
    t.false(isExpressionString('{ { "foo" }}'));
    t.false(isExpressionString('{{ }'));
    t.false(isExpressionString('{{ '));
});

test('[unit] ExpressionCompiler throws when compiling plain text', t => {
    t.throws(() => parseExpression(''));
    t.throws(() => parseExpression('this is not code'));
});
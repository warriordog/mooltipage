import test from 'ava';
import { TextCompiler } from '../../lib';

test('[unit] Text compiler recognises template text', t => {
    const textCompiler = new TextCompiler();

    t.true(textCompiler.isExpression('${ "foo" }'));
    t.true(textCompiler.isExpression('${ 1 }'));
    t.true(textCompiler.isExpression('${ "a" + "b" }'));
    t.true(textCompiler.isExpression('Hello${ ", " }World!'));
    t.true(textCompiler.isExpression('${ "foo" } ${ "bar" } ${ "baz" }'));

    t.false(textCompiler.isExpression('\\${ "foo" }'));
    t.false(textCompiler.isExpression('$ { "foo" }'));
    t.false(textCompiler.isExpression('${ '));
});

test('[unit] Text compiler recognises handlebars', t => {
    const textCompiler = new TextCompiler();

    t.true(textCompiler.isExpression('{{ "foo" }}'));
    t.true(textCompiler.isExpression('{{ 1 }}'));
    t.true(textCompiler.isExpression('{{ "a" + "b" }}'));

    t.false(textCompiler.isExpression('Hello{{ ", " }}World!'));
    t.false(textCompiler.isExpression('\\{{ "foo" }}'));
    t.false(textCompiler.isExpression('{ { "foo" }}'));
    t.false(textCompiler.isExpression('{{ }'));
    t.false(textCompiler.isExpression('{{ '));
});

test('[unit] Text compiler throws when compiling plain text', t => {
    const textCompiler = new TextCompiler();

    t.throws(() => textCompiler.compileExpression(''));
    t.throws(() => textCompiler.compileExpression('this is not code'));
});
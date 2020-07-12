import test from 'ava';
import { TextCompiler } from '../../lib/index';

test('[unit] Text compiler recognises template text', t => {
    const textCompiler = new TextCompiler();

    t.true(textCompiler.isScriptText('${ "foo" }'));
    t.true(textCompiler.isScriptText('${ 1 }'));
    t.true(textCompiler.isScriptText('${ "a" + "b" }'));
    t.true(textCompiler.isScriptText('Hello${ ", " }World!'));
    t.true(textCompiler.isScriptText('${ "foo" } ${ "bar" } ${ "baz" }'));

    t.false(textCompiler.isScriptText('\\${ "foo" }'));
    t.false(textCompiler.isScriptText('$ { "foo" }'));
    t.false(textCompiler.isScriptText('${ '));
});

test('[unit] Text compiler recognises handlebars', t => {
    const textCompiler = new TextCompiler();

    t.true(textCompiler.isScriptText('{{ "foo" }}'));
    t.true(textCompiler.isScriptText('{{ 1 }}'));
    t.true(textCompiler.isScriptText('{{ "a" + "b" }}'));

    t.false(textCompiler.isScriptText('Hello{{ ", " }}World!'));
    t.false(textCompiler.isScriptText('\\{{ "foo" }}'));
    t.false(textCompiler.isScriptText('{ { "foo" }}'));
    t.false(textCompiler.isScriptText('{{ }'));
    t.false(textCompiler.isScriptText('{{ '));
});

test('[unit] Text compiler throws when compiling plain text', t => {
    const textCompiler = new TextCompiler();

    t.throws(() => textCompiler.compileScriptText(''));
    t.throws(() => textCompiler.compileScriptText('this is not code'));
});
import { TestCallback, TestSet } from '../framework/testSet';
import { Args, parseArgs, ParseResult } from '../../bin/args';
import * as Assert from '../framework/assert';

export class CliArgsTests implements TestSet {
    // test methods

    private testNoArgs(): void {
        const argsList: Array<string> = [];

        const parseResult: ParseResult = parseArgs(argsList);

        Assert.IsFalse(parseResult.isValid);
    }

    private testSingleArg(): void {
        const argsList: Array<string> = [ './src' ];

        const parseResult: ParseResult = parseArgs(argsList);

        Assert.IsFalse(parseResult.isValid);
    }

    private testValidBasicArgs(): void {
        const argsList: Array<string> = [ './src', './dest' ];

        const parseResult: ParseResult = parseArgs(argsList);
        const args: Args = parseResult.getArgs();

        Assert.IsTrue(parseResult.isValid);
        Assert.AreEqual(args.inPath, './src');
        Assert.AreEqual(args.outPath, './dest');
        Assert.IsUndefined(args.pagePaths);
    }

    private testUnknownArg(): void {
        const argsList: Array<string> = [ './src', './dest', '--foo=bar' ];

        const parseResult: ParseResult = parseArgs(argsList);

        Assert.IsFalse(parseResult.isValid);
    }

    private testArgMissingValue(): void {
        const parseResult: ParseResult = parseArgs([ './src', './dest', '--page=' ]);

        Assert.IsFalse(parseResult.isValid);
    }

    private testValidSinglePage(): void {
        const argsList: Array<string> = [ './src', './dest', '--page=./src/pages' ];

        const parseResult: ParseResult = parseArgs(argsList);
        const args: Args = parseResult.getArgs();

        Assert.IsTrue(parseResult.isValid);
        Assert.AreEqual(args.inPath, './src');
        Assert.AreEqual(args.outPath, './dest');

        Assert.IsNotNullish(args.pagePaths);
        const validPagePaths: Array<string> = args.pagePaths as Array<string>;

        Assert.AreEqual(validPagePaths.length, 1);
        Assert.AreEqual(validPagePaths[0], './src/pages');
    }

    private testValidMultiplePages(): void {
        const argsList: Array<string> = [ './src', './dest', '--page=./src/pages', '--page=./src/pages2', '--page=./src/foo/page1.html' ];

        const parseResult: ParseResult = parseArgs(argsList);
        const args: Args = parseResult.getArgs();

        Assert.IsTrue(parseResult.isValid);
        Assert.AreEqual(args.inPath, './src');
        Assert.AreEqual(args.outPath, './dest');

        Assert.IsNotNullish(args.pagePaths);
        const validPagePaths: Array<string> = args.pagePaths as Array<string>;

        Assert.AreEqual(validPagePaths.length, 3);
        Assert.AreEqual(validPagePaths[0], './src/pages');
        Assert.AreEqual(validPagePaths[1], './src/pages2');
        Assert.AreEqual(validPagePaths[2], './src/foo/page1.html');
    }
    
    private testFormatter(): void {
        const argsList: Array<string> = [ './src', './dest', '--formatter=name' ];

        const parseResult: ParseResult = parseArgs(argsList);
        const args: Args = parseResult.getArgs();

        Assert.IsNotNullish(args.formatter);
        Assert.AreEqual(args.formatter, 'name');
    }
    
    private testDefaultFormatter(): void {
        const argsList: Array<string> = [ './src', './dest' ];

        const parseResult: ParseResult = parseArgs(argsList);
        const args: Args = parseResult.getArgs();

        Assert.IsTrue(parseResult.isValid);
        Assert.AreEqual(args.formatter, 'pretty');
    }

    // test set boilerplate
    readonly setName: string = 'CliArgsTests';
    getTests(): Map<string, TestCallback> {
        return new Map<string, TestCallback>([
            ['NoArgs', (): void => this.testNoArgs()],
            ['SingleArg', (): void => this.testSingleArg()],
            ['ValidBasicArgs', (): void => this.testValidBasicArgs()],
            ['UnknownArg', (): void => this.testUnknownArg()],
            ['ArgMissingValue', (): void => this.testArgMissingValue()],
            ['ValidSinglePage', (): void => this.testValidSinglePage()],
            ['ValidMultiplePages', (): void => this.testValidMultiplePages()],
            ['Formatter', (): void => this.testFormatter()],
            ['DefaultFormatter', (): void => this.testDefaultFormatter()]
        ]);
    }
}
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
        Assert.AreEqual('./src', args.inPath);
        Assert.AreEqual('./dest', args.outPath);
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
        Assert.AreEqual('./src', args.inPath);
        Assert.AreEqual('./dest', args.outPath, );

        Assert.IsNotNullish(args.pagePaths);
        const validPagePaths: Array<string> = args.pagePaths as Array<string>;

        Assert.AreEqual(1, validPagePaths.length);
        Assert.AreEqual('./src/pages', validPagePaths[0]);
    }

    private testValidMultiplePages(): void {
        const argsList: Array<string> = [ './src', './dest', '--page=./src/pages', '--page=./src/pages2', '--page=./src/foo/page1.html' ];

        const parseResult: ParseResult = parseArgs(argsList);
        const args: Args = parseResult.getArgs();

        Assert.IsTrue(parseResult.isValid);
        Assert.AreEqual('./src', args.inPath, );
        Assert.AreEqual('./dest', args.outPath);

        Assert.IsNotNullish(args.pagePaths);
        const validPagePaths: Array<string> = args.pagePaths as Array<string>;

        Assert.AreEqual(3, validPagePaths.length);
        Assert.AreEqual('./src/pages', validPagePaths[0], );
        Assert.AreEqual('./src/pages2', validPagePaths[1]);
        Assert.AreEqual('./src/foo/page1.html', validPagePaths[2]);
    }
    
    private testFormatter(): void {
        const argsList: Array<string> = [ './src', './dest', '--formatter=name' ];

        const parseResult: ParseResult = parseArgs(argsList);
        const args: Args = parseResult.getArgs();

        Assert.IsNotNullish(args.formatter);
        Assert.AreEqual('name', args.formatter);
    }
    
    private testDefaultFormatter(): void {
        const argsList: Array<string> = [ './src', './dest' ];

        const parseResult: ParseResult = parseArgs(argsList);
        const args: Args = parseResult.getArgs();

        Assert.IsTrue(parseResult.isValid);
        Assert.AreEqual('pretty', args.formatter);
    }

    // test set boilerplate
    readonly setName: string = 'CliArgs';
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
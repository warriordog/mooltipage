import os from 'os';

export class Args {
    readonly outPath: string;
    readonly inPath: string;
    readonly pagePaths?: Array<string>;
    readonly formatter?: string;

    constructor(outPath: string, inPath: string, pagePaths?: Array<string>, formatter?: string) {
        this.outPath = outPath;
        this.inPath = inPath;
        this.pagePaths = pagePaths;
        this.formatter = formatter ?? 'pretty';
    }
}

export class ParseResult {
    readonly args: Args | null;
    readonly output: string | null;
    readonly isValid: boolean;

    constructor(args: Args | null, output: string | null, isValid: boolean) {
        if (isValid && args == null) {
            throw new Error('A valid ParseResult must have a parsed Args object');
        }

        this.args = args;
        this.output = output;
        this.isValid = isValid;
    }

    getArgs(): Args {
        if (this.isValid && this.args != null) {
            return this.args;
        } else {
            throw new Error('Cannot get args from invalid ParseResult');
        }
    }

    getOutput(): string {
        return this.output ?? '';
    }
}

export function parseArgs(args: Array<string>): ParseResult {
    let outPath: string;
    let inPath: string;
    let pagePaths: Array<string> = [];
    let formatter: string | undefined;

    if (args.length == 0) {
        // print help if no args specified
        return createInvalidResult(printHelp());
    } else if (args.length >= 2) {
        // process args if enough found
        inPath = args[0];
        outPath = args[1];
    
        // parse any extra
        for (let i = 2; i < args.length; i++) {
            const arg = args[i];
            const argLower = arg.toLowerCase();
            
            if (argLower.startsWith('--page=')) {
                const pagePath = getArgValue(arg);

                // make sure its valid
                if (pagePath != null) {
                    pagePaths.push(pagePath);
                } else {
                    return createInvalidResult(printInvalidArgs());
                }
            } else if (argLower.startsWith('--formatter=')) {
                const formatterArg = getArgValue(arg);

                // make sure its valid
                if (formatterArg != null) {
                    formatter = formatterArg.toLowerCase();
                } else {
                    return createInvalidResult(printInvalidArgs());
                }
            } else {
                return createInvalidResult(printInvalidArgs());
            }
        }

        // args are OK
        const argsObj: Args = new Args(outPath, inPath, pagePaths.length > 0 ? pagePaths : undefined, formatter);

        return new ParseResult(argsObj, null, true);
    } else {
        // print help for wrong number of args
        return createInvalidResult(printInvalidArgs());
    }
}

function getArgValue(arg: string): string | null {
    const argParts = arg.split('=');

    // make sure a value was specified
    if (argParts.length == 2) {
        const argValue = argParts[1].trim();

        // make sure the value is not empty
        if (argValue.length > 0) {
            return argValue;
        } else {
            return null;
        }
    } else {
        return null;
    }
}

function createInvalidResult(output: string): ParseResult {
    return new ParseResult(null, output, false);
}

function printInvalidArgs(): string {
    return 'Invalid arguments.' + os.EOL + printHelp();
}

function printHelp(): string {
    return (
        'Usage: mooltipage <in_path> <out_path> [options]' + os.EOL +
        'If in_path and out_path are directories, then they will be recursively processed.' + os.EOL +
        'To limit which files are treated as pages, include one or more --page options.' + os.EOL +
        'Individual files or entire directories can be specified with --page.' + os.EOL +
        'CLI paths are resolved relative to the current working directory.' + os.EOL +
        os.EOL +
        'Options:' + os.EOL +
        '  --page=<page_path>' + os.EOL +
        '  --formatter=<html_formatter_name>'
    );
}
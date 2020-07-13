import os from 'os';

import { CliArgs } from "./args";
import { CliPipelineInterface } from './cliPipelineInterface';
import { PathUtils } from './pathUtils';
import { CliFileSystem } from './io/cliFileSystem';
import { Pipeline, HtmlFormatter, BasicHtmlFormatter } from "../lib/index";

export class MooltiPageCli {
    private readonly args: CliArgs;
    private readonly cliFs: CliFileSystem;
    private readonly pathUtils: PathUtils;

    constructor(args: CliArgs, cliFs: CliFileSystem) {
        this.args = args;
        this.cliFs = cliFs;
        this.pathUtils = new PathUtils(cliFs, args.inPath);
    }

    runCompile(): void {
        // create pipeline
        const pipelineInterface = new CliPipelineInterface(this.cliFs, this.args.inPath, this.args.outPath);
        const formatter = this.createFormatter();
        const pipeline = new Pipeline(pipelineInterface, formatter);

        // convert page arguments into full list of pages
        const pages = this.pathUtils.expandPagePaths(this.args.pages);

        // print stats
        this.printStats(pages);

        // compile each page
        for (const page of pages) {
            console.log(`Compiling [${ page }]...`);
            
            pipeline.compilePage(page);
        }

        console.log();
        console.log('Done.');
    }

    private createFormatter(): HtmlFormatter | undefined {
        switch (this.args.formatter) {
            case 'pretty':
                return new BasicHtmlFormatter(true, os.EOL);
            case 'ugly':
                return new BasicHtmlFormatter(false);
            case 'none':
                return undefined;
            case undefined:
                return undefined;
            default: {
                throw new Error(`Unknown HTML formatter: ${this.args.formatter}`);
            }
        }
    }

    private printStats(pages: string[]): void {
        console.log(`Source path: [${ this.args.inPath ?? '*unspecified*' }]`);
        console.log(`Destination path: [${ this.args.outPath ?? '*unspecified*' }]`);
        console.log(`Page count: ${ pages.length }`);
        console.log();
    }
}
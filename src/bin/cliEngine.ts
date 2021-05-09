import {CliArgs} from './args';
import {Mooltipage} from '../lib';
import {CliConsole} from './cli';
import {expandPagePaths} from './cliFs';

export class CliEngine {
    
    readonly args: CliArgs;
    readonly cliConsole: CliConsole;
    readonly mooltipage: Mooltipage;
    
    constructor(args: CliArgs, cliConsole: CliConsole) {
        this.args = args;
        this.cliConsole = cliConsole;
        this.mooltipage = this.createMooltipage();
    }
    
    async runApp(): Promise<void> {
        // convert page arguments into full list of pages
        const basePath = this.args.inPath ?? process.cwd();
        const pages = await expandPagePaths(this.args.pages, basePath);

        // print stats
        this.cliConsole.log(`Source path: [${ this.args.inPath ?? process.cwd() }]`);
        this.cliConsole.log(`Destination path: [${ this.args.outPath ?? process.cwd() }]`);
        this.cliConsole.log(`Page count: ${ pages.length }`);
        this.cliConsole.log();

        // compile each page
        this.mooltipage.processPages(pages);

        // we are done
        this.cliConsole.log();
        this.cliConsole.log('Done.');
    }
    
    protected createMooltipage(): Mooltipage {
        return new Mooltipage({
            inPath: this.args.inPath,
            outPath: this.args.outPath,
            formatter: this.args.formatter,
            onPageCompiled: page => this.cliConsole.log(`Compiled [${ page.path }].`)
        });
    }
}
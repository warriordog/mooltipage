export interface CliArgs {
    outPath?: string;
    inPath?: string;
    isHelp?: boolean;
    formatter: string;
    pages: string[];
}

export function parseArgs(args: string[]): CliArgs {
    // create parsing data object
    const parseData: CliArgs = {
        pages: [],
        formatter: 'pretty'
    };

    // print help if no args specified
    if (args.length == 0) {
        parseData.isHelp = true;
    } else {
        // parse args
        parsePages(args, parseData);
        parseOptions(args, parseData);
    }

    return parseData;
}

function parsePages(args: string[], parseData: CliArgs): void {
    // get page args
    const pages = args.filter(arg => !arg.startsWith('--'));

    if (pages.length > 0) {
        parseData.pages = pages;
    }
}
function parseOptions(args: string[], parseData: CliArgs): void {
    // get option args
    const options: CliOption[] = args
       .filter(arg => arg.startsWith('--'))
       .map(arg => {
           const parts = arg.split('=');
           return {
               label: parts[0],
               name: parts[0].toLowerCase(),
               value: parts.length > 1 ? parts[1] : undefined
           } as CliOption;
       });

    // process each option
    for (const option of options) {
        switch (option.name) {
            case '--help':
                parseData.isHelp = true;
                break;
            case '--inpath':
                if (!option.value) throw new Error('inPath requires a value');
                parseData.inPath = option.value;
                break;
            case '--outpath':
                if (!option.value) throw new Error('outPath requires a value');
                parseData.outPath = option.value;
                break;
            case '--formatter':
                if (!option.value) throw new Error('formatter requires a value');
                parseData.formatter = option.value;
                break;
            default:
                throw new Error(`Unknown option: ${ option.label }`);
        }
    }
}

interface CliOption {
    label: string,
    name: string,
    value?: string
}

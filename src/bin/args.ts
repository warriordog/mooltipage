/**
 * Stores CLI options.
 * Only contains the raw data, no validation is applied.
 */
export interface CliArgs {
    /**
     * Value of the --outpath parameter
     */
    outPath?: string;

    /**
     * Value of the --inpath parameter
     */
    inPath?: string;

    /**
     * If true, then --help was set.
     */
    isHelp?: boolean;

    /**
     * Value of --formatter parameter
     */
    formatter?: string;

    /**
     * List of all non-option parameters identified
     */
    pages: string[];
}

/**
 * Parse an array of string CLI arguments into a CliArgs structure.
 * @param args Array of string arguments to parse
 * @returns a CliArgs structure containing the parsed arguments
 */
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

/**
 * Extracts all page paths from a list of CLI arguments.
 * A page path is any "non-option" argument - aka any argument that does not start with "--"
 * @param args Array of args to parse
 * @param parseData CliArgs to receive parsed pages
 */
export function parsePages(args: string[], parseData: CliArgs): void {
    // get page args
    const pages = args.filter(arg => !arg.startsWith('--'));

    if (pages.length > 0) {
        parseData.pages = pages;
    }
}

/**
 * Parses known options from an array of arguments.
 * Basic validation is performed:
 * 1. If an argument requires a value but none is provided, then an exception will be thrown.
 * 2. If an argument is not recognised, then an exception will be thrown.
 *
 * @param args Array of args to parse
 * @param parseData CliArgs to receive parsed options
 * @throws if invalid arguments are encountered
 * @throws if unknown arguments are encountered
 */
export function parseOptions(args: string[], parseData: CliArgs): void {
    // get option args
    const options = extractOptions(args);

    // process each option
    for (const option of options) {
        switch (option.name) {
            case 'help':
                parseData.isHelp = true;
                break;
            case 'inpath':
                if (!option.value) throw new Error('inPath requires a value');
                parseData.inPath = option.value;
                break;
            case 'outpath':
                if (!option.value) throw new Error('outPath requires a value');
                parseData.outPath = option.value;
                break;
            case 'formatter':
                if (!option.value) throw new Error('formatter requires a value');
                parseData.formatter = option.value;
                break;
            default:
                throw new Error(`Unknown option: ${ option.label }`);
        }
    }
}

/**
 * Extracts all known options from a list of CLI arguments.
 * An option is any argument that starts with "--".
 * @param args string arguments to parse
 * @returns Array of CLIOptions objects parsed from input
 */
export function extractOptions(args: string[]): CliOption[] {
    return args
        .filter(arg => arg.startsWith('--'))
        .map((arg): CliOption => {
            const parts = arg.split('=');
            return {
                label: parts[0],
                name: parts[0].substring(2).toLowerCase(),
                value: parts.length > 1 ? parts[1] : undefined
            };
        });
}

/**
 * Stores an option parsed from the CLI
 */
export interface CliOption {
    /**
     * Human-readable display label of the option.
     * This is the exact string that was identified as an option.
     */
    label: string;

    /**
     * Computer-processable name / ID of the option.
     * In most cases, this is the same as {@link label} but trimmed and set to lower case.
     */
    name: string;

    /**
     * Value of the option, if present.
     */
    value?: string;
}

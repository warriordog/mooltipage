$.exampleData = {
    sections: {
        altOpts: {
            full: {
                lines: 17,
                language: 'javascript',
                code:
`const { Mooltipage } from 'mooltipage';

// create base config object
const baseConfig = {
    inPath: './src/',
    outPath: './dist/',.
    formatter: 'pretty'
};

// create mooltipage instances
const mp = new Mooltipage(baseConfig);
const mpSpecial = new Mooltipage(Object.assign(Object.create(baseConfig), {
    formatter: 'none'
});

// compile pages
mp.processPages([ './index.html', './pages/page1.html', './pages/page2.html' ]);
mpSpecial.processPage('./pages/special.html');`
            },
            sep: {
                lines: 9,
                language: 'javascript',
                code:
`const mooltipageConfigNoFormat = {
    inPath: './src/',
    outPath: './dist/
    formatter: 'none'
};

const mpNoFormat = new Mooltipage(mooltipageConfigNoFormat);

mpNoFormat.processPage('./pages/special.html');`
            },
            start: {
                lines: 21,
                language: 'javascript',
                code:
`// import and load mooltipage
const { Mooltipage } from 'mooltipage';

// prepare mooltipage config object
const mooltipageConfig = {
    // load inputs from "./src" folder
    inPath: './src/',
    // save outputs to "./dist" folder
    outPath: './dist/
    // format output HTML for human readability
    formatter: 'pretty'
};

// create mooltipage instance
const mp = new Mooltipage(mooltipageConfig);

// list pages to compiled
const pagePaths = [ './index.html', './pages/page1.html', './pages/page2.html' ];

// compile all pages
mp.processPages(pagePaths);`
            }
        },
        create: {
            config: {
                lines: 5,
                language: 'javascript',
                code:
`const mooltipageConfig = {
    inPath: './src/',
    outPath: './dist/',
    formatter: 'pretty'
};`
            },
            full: {
                lines: 15,
                language: 'javascript',
                code:
`// import and load mooltipage
const { Mooltipage } from 'mooltipage';

// prepare mooltipage config object
const mooltipageConfig = {
    // load inputs from "./src" folder
    inPath: './src/',
    // save outputs to "./dist" folder
    outPath: './dist/
    // format output HTML for human readability
    formatter: 'pretty'
};

// create mooltipage instance
const mp = new Mooltipage(mooltipageConfig);`
            },
            import: {
                lines: 1,
                language: 'javascript',
                code: `const { Mooltipage } from 'mooltipage';`
            },
            instance: {
                lines: 1,
                language: 'javascript',
                code: `const mp = new Mooltipage(mooltipageConfig);`
            }
        },
        dynamic: {
            args: {
                lines: 5,
                language: 'javascript',
                code:
`const pages = process.argv.slice(2);

for (const page of pages) {
    mp.processPage(page);
}`
            },
            env: {
                lines: 5,
                language: 'javascript',
                code:
`const isProduction = process.env.NODE_ENV === 'production';

if (!isProduction) {
    mp.processPage('./pages/debug.html');
}`
            }
        },
        feedback: {
            full: {
                lines: 27,
                language: 'javascript',
                code:
`const { Mooltipage } from 'mooltipage';

// create base config object
const baseConfig = {
    inPath: './src/',
    outPath: './dist/',
    formatter: 'pretty',
    onPageCompiled: (page) => console.log(\`Compiled \\\${ page.path }\`);
};

// create mooltipage instances
const mp = new Mooltipage(baseConfig);
const mpSpecial = new Mooltipage(Object.assign(Object.create(baseConfig), {
    formatter: 'none'
});

// compile pages
mp.processPages([ './index.html', './pages/page1.html', './pages/page2.html' ]);
mpSpecial.processPage('./pages/special.html');

// compile debug page if not in production
if (process.env.NODE_ENV !== 'production') {
    mp.processPage('./pages/debug.html');
}

// compile extra pages from CLI
mp.processPages(process.argv.slice(2));`
            },
            opts: {
                lines: 12,
                language: 'javascript',
                code:
`// Option 1
const config = {
    onPageCompiled: (page) => console.log(\`Compiled \\\${ page.path }\`);
}

// Option 2
function pageCompiledCallback(page) {
    console.log(\`Compiled \\\${ page.path }\`)
}
const config = {
    onPageCompiled: pageCompiledCallback
}`
            },
            page: {
                lines: 10,
                language: 'typescript',
                code:
`interface Page {
    // Path to the file (relative to inPath)
    readonly path: string;

    // Root of the Document Object Model (DOM) tree representing the page, can be used to examine the output
    readonly dom: DocumentNode;

    // Formatted HTML output of the compiled page
    readonly html: string;
}`
            },
            start: {
                lines: 26,
                language: 'javascript',
                code:
`const { Mooltipage } from 'mooltipage';

// create base config object
const baseConfig = {
    inPath: './src/',
    outPath: './dist/',
    formatter: 'pretty'
};

// create mooltipage instances
const mp = new Mooltipage(baseConfig);
const mpSpecial = new Mooltipage(Object.assign(Object.create(baseConfig), {
    formatter: 'none'
});

// compile pages
mp.processPages([ './index.html', './pages/page1.html', './pages/page2.html' ]);
mpSpecial.processPage('./pages/special.html');

// compile debug page if not in production
if (process.env.NODE_ENV !== 'production') {
    mp.processPage('./pages/debug.html');
}

// compile extra pages from CLI
mp.processPages(process.argv.slice(2));`
            }
        },
        multiple: {
            array: {
                lines: 2,
                language: 'javascript',
                code:
`const pagePaths = [ './index.html', './pages/page1.html', './pages/page2.html' ];
mp.processPages(pagePaths);`
            },
            manual: {
                lines: 3,
                language: 'javascript',
                code:
`mp.processPage('./index.html');
mp.processPage('./pages/page1.html');
mp.processPage('./pages/page2.html');`
            }
        },
        single: {
            code: {
                lines: 1,
                language: 'javascript',
                code: `mp.processPage('./index.html');`
            }
        }
    }
};
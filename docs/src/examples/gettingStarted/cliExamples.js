$.exampleData = {
    sections: {
        directory: {
            cmd: {
                lines: 1,
                language: 'shell',
                code: `npx mooltipage index.html pages/npx mooltipage index.html pages/`
            }
        },
        format: {
            minCmd: {
                lines: 1,
                language: 'shell',
                code: `npx mooltipage --formatter=minimized index.html`
            },
            noneCmd: {
                lines: 1,
                language: 'shell',
                code: `npx mooltipage --formatter=none index.html`
            },
            prettyCmd: {
                lines: 2,
                language: 'shell',
                code:
`npx mooltipage index.html
npx mooltipage --formatter=pretty index.html`
            }
        },
        inputPath: {
            cmd: {
                lines: 1,
                language: 'shell',
                code: `npx mooltipage --inPath=src src/index.html src/pages/`
            }
        },
        outputPath: {
            cmd: {
                lines: 1,
                language: 'shell',
                code: `npx mooltipage --inPath=src --outPath=dist/html src/folder/index.html`
            }
        },
        singlePage: {
            cmd: {
                lines: 1,
                language: 'shell',
                code: `npx mooltipage path/to/source/page.html`
            }
        },
        multiplePages: {
            cmd: {
                lines: 1,
                language: 'shell',
                code: `npx mooltipage index.html about.html sales.html`
            },
        },
        watch: {
            cli: {
                lines: 1,
                language: 'shell',
                code: `npx mooltipage index.html --watch`
            }
        }
    }
};
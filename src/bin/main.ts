#!/usr/bin/env node

import {cliMain} from './cli';

async function main(): Promise<void> {
    await cliMain(process.argv.slice(2), console);
}

main().catch(err => console.error(err));
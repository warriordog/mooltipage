const fs = require('fs');

const rmOptions = {
    recursive: true,
    maxRetries: 5,
    retryDelay: 250
};

fs.rmdirSync('dist', rmOptions);
fs.rmdirSync('docs', rmOptions);
fs.rmdirSync('.nyc_output', rmOptions);
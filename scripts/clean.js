const fs = require('fs');

const rmOptions = {
    recursive: true,
    maxRetries: 5,
    retryDelay: 250
};

fs.rmdirSync('dist', rmOptions);
fs.rmdirSync('coverage', rmOptions);
fs.rmdirSync('.nyc_output', rmOptions);
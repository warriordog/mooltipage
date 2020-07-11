const fs = require('fs');

const rmOptions = {
    recursive: true,
    maxRetries: 5,
    retryDelay: 25
};

fs.rmdirSync('dist', rmOptions);
fs.rmdirSync('coverage', rmOptions);
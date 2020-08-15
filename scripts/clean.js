const fs = require('fs');

function removePath(path) {
    // skip if it doesn't exist
    if (fs.existsSync(path)) {
        // get details
        const pathStat = fs.statSync(path);

        if (pathStat.isFile()) {
            // if file, then delete
            fs.unlinkSync(path);
        } else if (pathStat.isDirectory()) {
            // if directory, then recursively delete
            fs.rmdirSync(path, {
                recursive: true,
                maxRetries: 5,
                retryDelay: 250
            });
        }
    }
}

removePath('dist');
removePath('docs');
removePath('.nyc_output');
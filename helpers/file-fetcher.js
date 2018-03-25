const fs = require('fs')

// file-fetcher :: String -> String
module.exports = path => {
    const fname = path + '.rio'

    return new Promise((resolve, reject) => {
        fs.readFile(fname, {encoding: 'utf8'}, (err, str) => {
            if(err) {
                reject(err);
            } else {
                resolve(str);
            }
        });
    });
}


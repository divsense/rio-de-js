const fs = require('fs')

// file-fetcher :: String -> Promise(String)
module.exports = path => {

    const ext = path.split('.').pop()
    const fname = (ext === 'rio') ? path : path + '.rio'

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


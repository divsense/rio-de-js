const https = require('https')
const { URL } = require('url')

// nodeHttpsFetcher :: String -> Promise(String)
module.exports = u => {

    const url = new URL('https://' + u)

    const options = {
        hostname: url.hostname,
        port: 443,
        path: url.pathname,
        method: 'GET'
    };

    return new Promise((resolve, reject) => {

        const req = https.request(options, (res) => {
            //console.log('statusCode:', res.statusCode);
            //console.log('headers:', res.headers);

            var body = '';

            res.on('data', (chunk) => {
                body += chunk.toString();
            });

            res.on('end', () => {
                resolve(body);
            });

        });

        req.end();

        req.on('error', (e) => {
            reject(e);
        });


    });
}


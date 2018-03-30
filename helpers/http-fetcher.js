// nodeHttpsFetcher :: String -> Promise(String)
module.exports = function(url) {

    return new Promise((resolve, reject) => {

        const req = new XMLHttpRequest()
        req.open('GET', 'http://' + url)

        req.addEventListener('load', () => {
            if(req.status == 200) {
                resolve(req.response)
            } else {
                reject(Error(req.statusText))
            }
        })

        req.addEventListener('error', () => {
            reject(Error(req.statusText))
        })

        req.send()

    });
}


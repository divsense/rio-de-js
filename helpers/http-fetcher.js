// httpsFetcher :: String -> Promise(String)
module.exports = function(url) {

    const ext = url.split('.').pop()
    const _url = (ext === 'rio') ? url : url + '.rio'

    return new Promise((resolve, reject) => {

        const req = new XMLHttpRequest()
        req.open('GET', 'http://' + _url)

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


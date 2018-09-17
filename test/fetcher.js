const fs = require('fs')
const request = require('request-promise-native')

const httpFetcher = url => request({ method: 'GET', url })

const fileFetcher = url => {
    const [_, path] = url.split('file://')
    try{
        const content = fs.readFileSync(path, 'utf8')
        return Promise.resolve(content)
    } catch(e) {
        return Promise.reject(e)
    }
}

const fetchers = {
    'http': httpFetcher,
    'https': httpFetcher,
    'file': fileFetcher
}

module.exports = function(url) {
    const [protocol, path] = url.split('://')
    const fetch = fetchers[protocol]

    if(!fetch) {
        return Promise.reject('Fetch error. Unknown protocol: ' + protocol)
    }
    
    return fetch(url)
}

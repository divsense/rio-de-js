const fs = require('fs')
const path = require('path')

const httpFixtures = {
    'https://gist.githubusercontent.com/divsense/a064e8d5593fc4ed65bd22e0749faad1/raw/598f357f1256c2f3981255aaf7173bdb65c95756/promise-delay.rio': 'examples/promise/delay.rio',
    'https://gist.githubusercontent.com/divsense/fa4d8acff6a4e96b5ab38da008c81db3/raw/2ce37af6a13e100ed66dce18dd6b8af9acb5a70e/monad-composition.rio': 'examples/monad/composition.rio'
}

const readLocalFile = relativePath => {
    const fullPath = path.resolve(__dirname, '..', relativePath)
    try {
        const content = fs.readFileSync(fullPath, 'utf8')
        return Promise.resolve(content)
    } catch (e) {
        return Promise.reject(e)
    }
}

const httpFetcher = url => {
    const fixture = httpFixtures[url]
    if (!fixture) {
        return Promise.reject('Fetch error. No local fixture for URL: ' + url)
    }
    return readLocalFile(fixture)
}

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

// fetch-compile-install.js
// Fetches rio code, then compiles, then installs
//
const R = require('ramda')
const rio = require('riojs')
const { install, rioLibs, resolveImports } = require('../index.js')

// fetchCode :: (URL, {protocol:Function}) -> Promise(String)
const fetchCode = function(url, fetchers) {

    const parseLibName = new RegExp('^(\\w+)://(.+)')

    const result = parseLibName.exec(url)

    if(result) {
        const protocol = result[1]
        const name = result[2]

        if(fetchers[protocol]) {
            return fetchers[protocol](name)
        } else {
            return Promise.reject(Error('Lib name: ' + protocol + ' protocol is not supported'))
        }
    } else {
        return Promise.reject(Error('Invalid url: ' + url))
    }

}

// fci :: (URL, RioLibs, Fetchers) -> RioLibs
const fci = (url, riolibs, fetchers) =>
    fetchCode(url, fetchers)
        .then(rioCode => {
            const ast = rio.parse(rioCode)
            const missing = resolveImports(ast, riolibs)

            return missing.length === 0
                    ? Promise.resolve(install(url, ast, riolibs))
                    : Promise.all(missing.map(x => fci(x, riolibs, fetchers)))
                             .then(R.mergeAll)
                             .then(libs => Promise.resolve(install(url, ast, libs)))
        });

module.exports = fci


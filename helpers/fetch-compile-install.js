// fetch-compile-install.js
// Fetches rio code, then compiles, then installs
//
const R = require('ramda')
const rio = require('riojs')
const install = require('../src/install.js')
const rioLibs = require('../src/rio-libs.js')
const resolveImports = require('../src/resolve-imports.js')

const loc = x => ' (line: ' + x.start.line + ', column: ' + x.start.column + ')'

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
            return Promise.reject({message:'Lib name: ' + protocol + ' protocol is not supported'})
        }
    } else {
        return Promise.reject({message:'Invalid url: ' + url})
    }

}

// fci :: (URL, RioLibs, Fetchers, {String:String}) -> RioLibs
const fci = (url, riolibs, fetchers, endpoints) => {
    const uparts = R.split('::', url)
    const _url = (endpoints && uparts[0] && endpoints[uparts[0]]) ? (endpoints[uparts[0]] + uparts[1]) : url

    return fetchCode(_url, fetchers)
        .then(rioCode => {
            const ast = rio.parse(rioCode)
            const missing = resolveImports(ast, riolibs)

            return missing.length === 0
                    ? Promise.resolve(install(url, ast, riolibs))
                    : Promise.all(missing.map(x => fci(x, riolibs, fetchers, endpoints)))
                             .then(R.mergeAll)
                             .then(libs => Promise.resolve(install(url, ast, libs)))
        })
        .catch(e => {
            const message = (e.message || e.Error || e) + (e.location ? loc(e.location) : '')
            return Promise.reject({message})
        })
}

module.exports = fci


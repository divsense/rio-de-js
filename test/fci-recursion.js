
const fci = require('../helpers/fetch-compile-install.js')
const { rioLibs, libFunction } = require('../rio.de.js')

const assert = require('./assert')

const captureError = async promise => {
    try {
        await promise
        return null
    } catch (e) {
        return e
    }
}

describe('FCI Recursion', function() {

    it('should recursively fetch and install nested imports', async function() {
        const sources = {
            'file://root.rio': `
                export total
                import 'file://dep.rio'
                total = x -> inc(dep(x))
            `,
            'file://dep.rio': `
                export dep
                dep = x -> add(x, 1)
            `
        }

        const calls = []
        const fetch = url => {
            calls.push(url)
            if (sources[url]) return Promise.resolve(sources[url])
            return Promise.reject('Missing fixture: ' + url)
        }

        const libs = await fci('file://root.rio', rioLibs, fetch)
        const total = libFunction(libs, 'file://root.rio', 'total')

        assert.deepEqual(calls, ['file://root.rio', 'file://dep.rio'])
        assert.isFunction(total)
        assert.equal(total(3), 5)
    })

    it('should return normalized error when imported dependency is missing', async function() {
        const sources = {
            'file://root.rio': `
                export total
                import 'file://missing.rio'
                total = x -> x
            `
        }

        const fetch = url => {
            if (sources[url]) return Promise.resolve(sources[url])
            return Promise.reject('Missing fixture: ' + url)
        }

        const err = await captureError(fci('file://root.rio', rioLibs, fetch))

        assert.isOk(err)
        assert.equal(err.message, 'Missing fixture: file://missing.rio')
    })
})

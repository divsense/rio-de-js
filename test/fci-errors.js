
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

describe('FCI Errors', function() {

    it('should normalize rejected string errors to an object with message', async function() {
        const fetch = () => Promise.reject('boom')
        const err = await captureError(fci('file://./examples/maybe.rio', rioLibs, fetch))

        assert.isOk(err)
        assert.equal(err.message, 'boom')
    })

    it('should normalize rejected error objects to their message', async function() {
        const fetch = () => Promise.reject({ message: 'bad-fetch' })
        const err = await captureError(fci('file://./examples/maybe.rio', rioLibs, fetch))

        assert.isOk(err)
        assert.equal(err.message, 'bad-fetch')
    })

    it('should reject parse failures with parser message', async function() {
        const fetch = () => Promise.resolve('export x\nx =')
        const err = await captureError(fci('file://./broken.rio', rioLibs, fetch))

        assert.isOk(err)
        assert.include(err.message, 'Missing initializer')
    })

    it('should resolve endpoint aliases before fetching', async function() {
        const calls = []
        const fetch = url => {
            calls.push(url)
            return Promise.resolve('export id\nid = x -> x')
        }

        const libs = await fci(
            'mart::id.rio',
            rioLibs,
            fetch,
            { mart: 'file://./examples/' }
        )

        const id = libFunction(libs, 'mart::id.rio', 'id')

        assert.deepEqual(calls, ['file://./examples/id.rio'])
        assert.isFunction(id)
        assert.equal(id(3), 3)
    })
})

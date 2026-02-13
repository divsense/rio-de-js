const rio = require('riojs')

const install = require('../src/install.js')
const rioLibs = require('../src/rio-libs.js')
const libFunction = require('../src/lib-function.js')

const assert = require('./assert')

const parse = source => rio.parse(source)
const thrownMessage = fn => {
    try {
        fn()
        return null
    } catch (e) {
        return e && e.message
    }
}

describe('Install', function() {

    it('should install compiled module into libs map', function() {
        const url = 'file://id.rio'
        const ast = parse('export id\nid = x -> x')

        const libs = install(url, ast, rioLibs)
        const id = libFunction(libs, url, 'id')

        assert.isFunction(id)
        assert.equal(id(7), 7)
        assert.property(libs, 'ramda')
    })

    it('should support installed modules that use default ramda symbols', function() {
        const url = 'file://plusone.rio'
        const ast = parse('export plusOne\nplusOne = x -> inc(x)')

        const libs = install(url, ast, rioLibs)
        const plusOne = libFunction(libs, url, 'plusOne')

        assert.equal(plusOne(4), 5)
    })

    it('should throw when unresolved symbols remain', function() {
        const ast = parse('export broken\nbroken = x -> unknown(x)')
        const message = thrownMessage(() => install('file://broken.rio', ast, rioLibs))

        assert.include(message, 'Unknown symbol: unknown')
    })
})

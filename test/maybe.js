const chai = require('chai')
const rio = require('riojs')

const fromFile = require('../helpers/file-fetcher.js')
const fci = require('../helpers/fetch-compile-install.js')
const { rioLibs, libFunction } = require('../index.js')

const assert = chai.assert

const fetchers = {
    file: fromFile
}

const libUrl = 'file://./mart/divsense/maybe'

var Rio = rioLibs;

beforeEach(function() {
    return fci(libUrl, Rio, fetchers).then(function(x) { Rio = x });
})

describe('Maybe', function() {
    it('Just should return Object with property "value"', function() {
        const Just = libFunction(Rio, libUrl, 'Just')
        assert(Just, 'Just function not found')
        assert.equal(Just(3).value, 3)
    });

    it('Nothing should return Object without property "value"', function() {
        const Nothing = libFunction(Rio, libUrl, 'Nothing')
        assert(Nothing, 'Nothing function not found')
        assert.notProperty(Nothing(), 'value')
    });

    it('isJust should return if object has property "value"', function() {
        const Just = libFunction(Rio, libUrl, 'Just')
        const isJust = libFunction(Rio, libUrl, 'isJust')
        const isNothing = libFunction(Rio, libUrl, 'isNothing')
        const x = Just(3)
        assert.isTrue(isJust(x))
        assert.isFalse(isNothing(x))
    });

    it('isNothing should return if object has property "value"', function() {
        const Nothing = libFunction(Rio, libUrl, 'Nothing')
        const isNothing = libFunction(Rio, libUrl, 'isNothing')
        const isJust = libFunction(Rio, libUrl, 'isJust')
        const x = Nothing()
        assert.isTrue(isNothing(x))
        assert.isFalse(isJust(x))
    });

    it('maybe should return Maybe instance', function() {
        const isNothing = libFunction(Rio, libUrl, 'isNothing')
        const isJust = libFunction(Rio, libUrl, 'isJust')
        const maybe = libFunction(Rio, libUrl, 'maybe')

        const x = maybe(0)
        const y = maybe(null)

        assert.isTrue(isJust(x))
        assert.isTrue(isNothing(y))
    });

});

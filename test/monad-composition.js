const chai = require('chai')
const rio = require('riojs')

const fetch = require('./fetcher.js')
const fci = require('../helpers/fetch-compile-install.js')
const { rioLibs, libFunction } = require('../rio.de.js')

const assert = chai.assert

const libUrl = 'file://./examples/monad/composition.rio'

describe('Monad Composition', function() {

    var Rio = rioLibs;

    before(function() {
        return fci(libUrl, Rio, fetch).then(function(x) { Rio = x });
    })

    it('add11 should return Maybe instance', function() {
        const add11_1 = libFunction(Rio, libUrl, 'add11_1')
        const add11_2 = libFunction(Rio, libUrl, 'add11_2')
        const add11_3 = libFunction(Rio, libUrl, 'add11_3')

        assert(add11_1)
        assert(add11_2)
        assert(add11_3)

        const x1 = add11_1(10)
        const x2 = add11_2(10)
        const x3 = add11_3(10)

        assert.property(x1, 'value')
        assert.property(x2, 'value')
        assert.property(x3, 'value')

        assert.propertyVal(x1, 'value', 21)
        assert.propertyVal(x2, 'value', 21)
        assert.propertyVal(x3, 'value', 21)

        const y1 = add11_1()
        const y2 = add11_2()
        const y3 = add11_3()

        assert.notProperty(y1, 'value')
        assert.notProperty(y2, 'value')
        assert.notProperty(y3, 'value')
    });

});


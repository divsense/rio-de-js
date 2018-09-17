const chai = require('chai')
const rio = require('riojs')

const fetch = require('./fetcher.js')
const fci = require('../helpers/fetch-compile-install.js')
const { rioLibs, libFunction } = require('../rio.de.js')

const assert = chai.assert

const libUrl = 'file://./examples/calc.rio'

describe('Calc', function() {

    var Rio = rioLibs;

    before(function() {
        return fci(libUrl, Rio, fetch).then(function(x) { Rio = x });
    })

    it('Summa should return total of inputs', function() {

        const func = libFunction(Rio, libUrl, 'summa')

        assert(func, 'Summa function not found')

        const inputs = [{value: 1}, {value: 2}]

        assert.equal(func(inputs), 3)

    });

    it('radic should return radic of inputs', function() {

        const func = libFunction(Rio, libUrl, 'radic')

        assert(func, 'radic function not found')

        const inputs = [{value: 4}, {value: 2}]

        assert.equal(func(inputs), 2)

    });
});


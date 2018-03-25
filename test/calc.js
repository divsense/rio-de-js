const chai = require('chai')
const rio = require('riojs')

const fromFile = require('../helpers/file-fetcher.js')
const fci = require('../helpers/fetch-compile-install.js')
const { rioLibs, libFunction } = require('../index.js')

const assert = chai.assert

const fetchers = {
    file: fromFile
}

const libUrl = 'file://./mart/divsense/calc'

var Rio = rioLibs;

beforeEach(function() {
    return fci(libUrl, Rio, fetchers)
            .then(function(x) { Rio = x });
})

describe('Calc', function() {
    it('Summa should return total of inputs', function() {

        const func = libFunction(Rio, libUrl, 'summa')

        assert(func, 'Summa function not found')

        const inputs = [{value: 1}, {value: 2}]

        return assert.equal(func(inputs), 3)

    });

    it('Radic should return radic of inputs', function() {

        const func = libFunction(Rio, libUrl, 'radic')

        assert(func, 'Radic function not found')

        const inputs = [{value: 4}, {value: 2}]

        return assert.equal(func(inputs), 2)

    });
});


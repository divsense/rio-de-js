const chai = require('chai')
const rio = require('riojs')

const fromHttps = require('../helpers/node-https-fetcher.js')
const fci = require('../helpers/fetch-compile-install.js')
const { rioLibs, libFunction } = require('../index.js')

const assert = chai.assert

const fetchers = {
    https: fromHttps
}

const libUrl = 'https://gist.githubusercontent.com/divsense/fa4d8acff6a4e96b5ab38da008c81db3/raw/2ce37af6a13e100ed66dce18dd6b8af9acb5a70e/monad-composition.rio'

describe.skip('Monad Composition', function() {

    var Rio = rioLibs;

    before(function() {
        return fci(libUrl, Rio, fetchers).then(function(x) { Rio = x });
    })

    it('add11 should return Maybe instance', function() {
        const add11_1 = libFunction(Rio, libUrl, 'add11_1')

        assert(add11_1, 'add11_1 function not found')

        const x1 = add11_1(10)

        assert.propertyVal(x1, 'value', 21)
    });

});


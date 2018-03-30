const chai = require('chai')
const rio = require('riojs')
const R = require('ramda')

const fromFile = require('../helpers/file-fetcher.js')
const fci = require('../helpers/fetch-compile-install.js')
const { rioLibs, libFunction } = require('../index.js')

const assert = chai.assert

const fetchers = {
    file: fromFile
}

const libUrl = 'file://./examples/parser'

describe('Parser', function() {

    var Rio = rioLibs;
    var Parser, pure;

    before(function() {
        return fci(libUrl, Rio, fetchers).then(function(x) {
            Rio = x;
            Parser = libFunction(Rio, libUrl, 'Parser');
            pure = libFunction(Rio, libUrl, 'pure');
            assert(Parser, 'Parser function not found')
            assert(pure, '"pure" function not found')
        });
    })

    it('should implement Functor type', function() {

        const x = pure('a')

        const y = x.map(a => 'c' + a)

        const result = y.run()

        assert.equal(result, 'ca')

    });

    it('should implement Applicative type', function() {

        const x = pure(a => b => 'd' + a + b)
        const y = pure('a')
        const z = pure('b')

        const r = x.ap(y).ap(z)

        const result = r.run()

        assert.equal(result, 'dab')

    });
});


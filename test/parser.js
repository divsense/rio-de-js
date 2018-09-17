const chai = require('chai')
const rio = require('riojs')
const R = require('ramda')

const fetch = require('./fetcher.js')
const fci = require('../helpers/fetch-compile-install.js')
const { rioLibs, libFunction } = require('../rio.de.js')

const assert = chai.assert

const libUrl = 'file://./examples/parser.rio'

describe('Parser', function() {

    var Rio = rioLibs;
    var Parser, pure, fail, eval;

    before(function() {
        return fci(libUrl, Rio, fetch).then(function(x) {
            Rio = x;
            Parser = libFunction(Rio, libUrl, 'Parser');
            pure = libFunction(Rio, libUrl, 'pure');
            fail = libFunction(Rio, libUrl, 'fail');
            eval = libFunction(Rio, libUrl, 'eval');
            assert(Parser, 'Parser function not found');
            assert(pure, '"pure" function not found');
            assert(fail, '"fail" function not found');
            assert(eval, '"eval" function not found');
        });
    })

    it('should implement Functor type', function() {

        const x = pure('a')

        const y = x.map(a => 'c' + a)

        const result = eval(y, '')

        assert.equal(result[0], 'ca')

    });

    it('should implement Applicative type', function() {

        const x = pure(a => b => 'd' + a + b)
        const y = pure('a')
        const z = pure('b')

        const r = x.ap(() => y).ap(() => z)

        const result = eval(r, '')

        assert.equal(result[0], 'dab')

    });

    it('should implement Alternative type', function() {

        const x = fail()
        const y = pure('b')

        const r = x.alt(() => y)

        const result = r.parse()

        assert.equal(result[0], 'b')

    });

    it('should implement item function', function() {

        const item = libFunction(Rio, libUrl, 'item');
        assert(item, '"item" function not found')

        const result = eval(item(), 'abc')
        assert.equal(result[0], 'a')

        const empty = eval(item(), '')
        assert.equal(empty, null)

    });

    it('should implement sat function', function() {

        const sat = libFunction(Rio, libUrl, 'sat');
        assert(sat, '"sat" function not found')

        const a = sat(R.equals('f'))

        const result = a.parse('function')
        assert.equal(result[0], 'f')

    });

    it('should implement string function', function() {

        const string = libFunction(Rio, libUrl, 'string');
        assert(string, '"string" function not found')

        const a = string('foo')

        const a_result = a.parse('foobar')
        assert.equal(a_result[0], 'foo')
        assert.equal(a_result[1], 'bar')

    });

    it('should implement some and many', function() {
        const some = libFunction(Rio, libUrl, 'some');
        const many = libFunction(Rio, libUrl, 'many');
        const digit = libFunction(Rio, libUrl, 'digit');
        const space = libFunction(Rio, libUrl, 'space');

        assert(some, '"some" function not found')
        assert(many, '"many" function not found')
        assert(digit, '"digit" function not found')
        assert(space, '"space" function not found')

        const y = some(digit).parse('123doom')

        assert.equal( y[0][0], '1')
        assert.equal( y[0][1], '2')
        assert.equal( y[0][2], '3')
        assert.equal( y[1], 'doom')

        const z = some(digit).parse('doom')

        assert.equal( z, null)

        const x = many(digit).parse('domm')

        assert.equal( x[0], '')
        assert.equal( x[1], 'domm')

        const s = space.parse('     domm')

        assert.equal( s[0], '')
        assert.equal( s[1], 'domm')


    });

    it('should implement string function', function() {

        const string = libFunction(Rio, libUrl, 'string');
        const token = libFunction(Rio, libUrl, 'token');

        assert(token, '"token" function not found')

        const a = token(string('foo'))

        const a_result = a.parse('   foo bar')

        assert.equal(a_result[0], 'foo')
        assert.equal(a_result[1], 'bar')

    });

});


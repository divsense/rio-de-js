
const fetch = require('./fetcher.js')
const fci = require('../helpers/fetch-compile-install.js')
const { rioLibs, libFunction } = require('../rio.de.js')

const assert = require('./assert')

const libUrl = 'file://./examples/parser.rio'

const createSeededRng = seed => () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 4294967296
}

const randomWord = (rng, maxLen) => {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz'
    const len = 1 + Math.floor(rng() * maxLen)
    let out = ''
    for (let i = 0; i < len; i++) {
        const ix = Math.floor(rng() * alphabet.length)
        out += alphabet[ix]
    }
    return out
}

describe('Parser Properties', function() {
    let Rio = rioLibs
    let pure
    let fail
    let evalParser
    let string
    let token

    before(function() {
        return fci(libUrl, Rio, fetch).then(function(x) {
            Rio = x
            pure = libFunction(Rio, libUrl, 'pure')
            fail = libFunction(Rio, libUrl, 'fail')
            evalParser = libFunction(Rio, libUrl, 'eval')
            string = libFunction(Rio, libUrl, 'string')
            token = libFunction(Rio, libUrl, 'token')

            assert.isFunction(pure)
            assert.isFunction(fail)
            assert.isFunction(evalParser)
            assert.isFunction(string)
            assert.isFunction(token)
        })
    })

    it('functor identity should hold for sampled values', function() {
        const rng = createSeededRng(1234)

        for (let i = 0; i < 20; i++) {
            const value = randomWord(rng, 12)
            const input = randomWord(rng, 8)

            const lhs = evalParser(pure(value).map(x => x), input)
            const rhs = evalParser(pure(value), input)

            assert.deepEqual(lhs, rhs)
        }
    })

    it('functor composition should hold for sampled values', function() {
        const rng = createSeededRng(5678)
        const f = x => x + 'f'
        const g = x => x + 'g'

        for (let i = 0; i < 20; i++) {
            const value = randomWord(rng, 10)

            const lhs = evalParser(pure(value).map(f).map(g), '')
            const rhs = evalParser(pure(value).map(x => g(f(x))), '')

            assert.deepEqual(lhs, rhs)
        }
    })

    it('applicative identity should hold for sampled values', function() {
        const rng = createSeededRng(9012)

        for (let i = 0; i < 20; i++) {
            const value = randomWord(rng, 10)
            const parser = pure(value)

            const lhs = evalParser(pure(x => x).ap(() => parser), '')
            const rhs = evalParser(parser, '')

            assert.deepEqual(lhs, rhs)
        }
    })

    it('alternative should recover from fail for sampled values', function() {
        const rng = createSeededRng(3456)

        for (let i = 0; i < 20; i++) {
            const value = randomWord(rng, 10)
            const input = randomWord(rng, 6)

            const lhs = evalParser(fail().alt(() => pure(value)), input)
            const rhs = evalParser(pure(value), input)

            assert.deepEqual(lhs, rhs)
        }
    })

    it('token(string(x)) should consume leading and trailing spaces', function() {
        const rng = createSeededRng(7890)

        for (let i = 0; i < 20; i++) {
            const word = randomWord(rng, 6)
            const tail = randomWord(rng, 5)
            const input = '   ' + word + '   ' + tail

            const parsed = token(string(word)).parse(input)

            assert.equal(parsed[0], word)
            assert.equal(parsed[1], tail)
        }
    })
})

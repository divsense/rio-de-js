const rio = require('riojs')

const compile = require('../src/compile.js')

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

describe('Compile Errors', function() {

    it('should fail when no exports exist', function() {
        const ast = parse('value = x -> x')
        const message = thrownMessage(() => compile(ast, []))

        assert.equal(message, 'No exports found')
    })

    it('should fail when more than one export exists', function() {
        const ast = parse('export a\na = x -> x\nexport b\nb = x -> x')
        const message = thrownMessage(() => compile(ast, []))

        assert.equal(message, 'Unexpected "return" statement')
    })

    it('should report unresolved symbol name and source location', function() {
        const ast = parse('export total\ntotal = x -> missing(x)')
        const message = thrownMessage(() => compile(ast, []))

        assert.include(message, 'Unknown symbol: missing')
        assert.include(message, 'line: 2')
        assert.include(message, 'column: 14')
    })
})

const rio = require('riojs')

const importedSymbols = require('../src/imported-symbols.js')

const assert = require('./assert')

const parse = source => rio.parse(source)

describe('Imported Symbols', function() {

    it('should extract imported and aliased local symbols', function() {
        const ast = parse(`
            export x
            import 'io' { delay as wait }
            import 'promise' { promiseResolve }
            x = value -> wait(value)
        `)

        assert.deepEqual(importedSymbols(ast), ['delay', 'wait', 'promiseResolve'])
    })

    it('should return an empty list when there are no imports', function() {
        const ast = parse('export x\nx = value -> value')

        assert.deepEqual(importedSymbols(ast), [])
    })

    it('should include imported name when no local alias is used', function() {
        const ast = parse(`
            export x
            import 'io' { delay }
            x = delay
        `)

        assert.deepEqual(importedSymbols(ast), ['delay'])
    })
})

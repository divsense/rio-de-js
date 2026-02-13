
const buildScope = require('../src/build-scope.js')

const assert = require('./assert')

const identity = x => x
const noop = () => null

const libs = {
    ramda: {
        names: ['add', 'map'],
        functions: [identity, noop]
    },
    io: {
        names: ['delay'],
        functions: [noop]
    }
}

describe('Build Scope', function() {

    it('should include default ramda scope when no imports are declared', function() {
        const ast = { body: [] }
        const res = buildScope(ast, libs)

        assert.deepEqual(res.imports, ['add', 'map'])
        assert.lengthOf(res.scope, 1)
        assert.deepEqual(res.scope[0].names, ['add', 'map'])
    })

    it('should include selected import symbols and aliases', function() {
        const ast = {
            body: [
                {
                    type: 'ImportDeclaration',
                    source: { value: 'ramda' },
                    specifiers: [
                        { imported: { name: 'add' }, local: { name: 'sum' } },
                        { imported: { name: 'map' } }
                    ]
                }
            ]
        }

        const res = buildScope(ast, libs)

        assert.deepEqual(res.imports, ['sum', 'map'])
        assert.deepEqual(res.scope[0].names, ['sum', 'map'])
    })

    it('should throw when an imported function does not exist', function() {
        const ast = {
            body: [
                {
                    type: 'ImportDeclaration',
                    source: { value: 'ramda' },
                    specifiers: [{ imported: { name: 'missing' } }]
                }
            ]
        }

        assert.throws(
            () => buildScope(ast, libs),
            'Imported function not found: missing'
        )
    })

    it('should support exclusive import mode with aliasing', function() {
        const ast = {
            body: [
                {
                    type: 'ImportDeclaration',
                    source: { value: 'ramda' },
                    exclusive: true,
                    specifiers: [{ imported: { name: 'add' }, local: { name: 'sum' } }]
                }
            ]
        }

        const res = buildScope(ast, libs)

        assert.deepEqual(res.imports, ['sum', 'map'])
        assert.deepEqual(res.scope[0].names, ['sum', 'map'])
    })

    it('should throw on invalid import specifier entries', function() {
        const ast = {
            body: [
                {
                    type: 'ImportDeclaration',
                    source: { value: 'ramda' },
                    specifiers: [{}]
                }
            ]
        }

        assert.throws(
            () => buildScope(ast, libs),
            'Invalid Import Specifier'
        )
    })
})

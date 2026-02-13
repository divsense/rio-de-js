
const resolveImports = require('../src/resolve-imports.js')

const assert = require('./assert')

describe('Resolve Imports', function() {

    it('should return only missing imports', function() {
        const ast = {
            body: [
                { type: 'ImportDeclaration', source: { value: 'ramda' } },
                { type: 'ImportDeclaration', source: { value: 'custom-lib' } },
                { type: 'VariableDeclaration' }
            ]
        }

        const libs = { ramda: {}, io: {} }

        assert.deepEqual(resolveImports(ast, libs), ['custom-lib'])
    })

    it('should return empty list when all imports are resolved', function() {
        const ast = {
            body: [
                { type: 'ImportDeclaration', source: { value: 'ramda' } },
                { type: 'ImportDeclaration', source: { value: 'io' } }
            ]
        }

        const libs = { ramda: {}, io: {} }

        assert.deepEqual(resolveImports(ast, libs), [])
    })
})

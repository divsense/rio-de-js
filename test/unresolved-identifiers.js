const rio = require('riojs')

const unresolvedIdentifiers = require('../src/unresolved-identifiers.js')

const assert = require('./assert')

const parse = source => rio.parse(source)
const unresolvedNames = (imports, source) =>
    unresolvedIdentifiers(imports, parse(source)).map(x => x.name)

describe('Unresolved Identifiers', function() {

    it('should not mark imported or locally scoped symbols as unresolved', function() {
        const names = unresolvedNames(['add'], `
            export f
            f = x -> {
                y = x
                g = z -> add(y, z)
                return g(2)
            }
        `)

        assert.deepEqual(names, [])
    })

    it('should report unknown symbols used in expressions', function() {
        const names = unresolvedNames([], 'export f\nf = x -> missing(x)')

        assert.deepEqual(names, ['missing'])
    })

    it('should report each unresolved symbol only once', function() {
        const names = unresolvedNames([], 'export f\nf = x -> add(mystery(x), mystery(2))')

        assert.deepEqual(names.sort(), ['add', 'mystery'])
    })

    it('should consider only object identifier for member expressions', function() {
        const ast = {
            type: 'Program',
            body: [
                {
                    type: 'ReturnStatement',
                    argument: {
                        type: 'ObjectPattern',
                        properties: [
                            {
                                type: 'Property',
                                key: { type: 'Identifier', name: 'f' },
                                value: { type: 'Identifier', name: 'f' }
                            }
                        ]
                    }
                },
                {
                    type: 'VariableDeclaration',
                    declarations: [
                        {
                            type: 'VariableDeclarator',
                            id: { type: 'Identifier', name: 'f' },
                            init: {
                                type: 'ArrowFunctionExpression',
                                params: [],
                                body: {
                                    type: 'MemberExpression',
                                    object: { type: 'Identifier', name: 'source' },
                                    property: { type: 'Identifier', name: 'value' },
                                    computed: false
                                }
                            }
                        }
                    ]
                }
            ]
        }

        const names = unresolvedIdentifiers([], ast).map(x => x.name)

        assert.deepEqual(names, ['source'])
    })
})


const makeLib = require('../src/make-lib.js')

const assert = require('./assert')

describe('Make Lib', function() {

    it('should bind imports in order and expose requested exports', function() {
        const plus1 = x => x + 1
        const times2 = x => x * 2

        const code = 'return { calc: x => times2(plus1(x)), passthrough: x => x }'
        const scope = [
            { names: ['plus1'], functions: [plus1] },
            { names: ['times2'], functions: [times2] }
        ]

        const lib = makeLib(code, scope, ['plus1', 'times2'], ['calc', 'passthrough'])

        assert.deepEqual(lib.names, ['calc', 'passthrough'])
        assert.equal(lib.functions[0](3), 8)
        assert.equal(lib.functions[1]('ok'), 'ok')
    })

    it('should keep export order from the export list', function() {
        const code = 'return { a: () => "a", b: () => "b" }'
        const lib = makeLib(code, [], [], ['b', 'a'])

        assert.deepEqual(lib.names, ['b', 'a'])
        assert.equal(lib.functions[0](), 'b')
        assert.equal(lib.functions[1](), 'a')
    })
})

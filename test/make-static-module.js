const rio = require('riojs')

const msm = require('../helpers/make-static-module.js')

const assert = require('./assert')

const compileStatic = source => msm(rio.parse(source))

describe('Make Static Module', function() {

    it('should not mark built-in promise helpers as unresolved', function() {
        const res = compileStatic('export total\ntotal = x -> promiseResolve(x)')

        assert.deepEqual(res.unresolved, [])
        assert.include(res.code, 'const promiseResolve = Promise.resolve.bind(Promise)')
        assert.include(res.code, 'exports.total=total')
    })

    it('should auto-include ramda imports for unresolved ramda symbols', function() {
        const res = compileStatic('export value\nvalue = add(1, 2)')

        assert.deepEqual(res.unresolved, [])
        assert.include(res.code, "require('ramda')")
        assert.include(res.code, '{add}')
    })

    it('should report truly unknown identifiers as unresolved', function() {
        const res = compileStatic('export value\nvalue = mystery(1)')

        assert.lengthOf(res.unresolved, 1)
        assert.equal(res.unresolved[0].name, 'mystery')
        assert.equal(res.unresolved[0].loc.start.line, 2)
    })
})

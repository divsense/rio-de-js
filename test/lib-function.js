
const libFunction = require('../src/lib-function.js')

const assert = require('./assert')

describe('Lib Function', function() {

    it('should return the function when url and name exist', function() {
        const libs = {
            'file://module.rio': {
                names: ['sum'],
                functions: [x => x + 1]
            }
        }

        const fn = libFunction(libs, 'file://module.rio', 'sum')

        assert.isFunction(fn)
        assert.equal(fn(2), 3)
    })

    it('should return undefined when export name is missing', function() {
        const libs = {
            'file://module.rio': {
                names: ['sum'],
                functions: [x => x + 1]
            }
        }

        assert.isUndefined(libFunction(libs, 'file://module.rio', 'missing'))
    })

    it('should return undefined when module url is missing', function() {
        const libs = {
            'file://module.rio': {
                names: ['sum'],
                functions: [x => x + 1]
            }
        }

        assert.isUndefined(libFunction(libs, 'file://missing.rio', 'sum'))
    })
})

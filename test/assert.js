const nodeAssert = require('node:assert')

const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key)

const normalizeErrorMessage = err => (err && err.message) ? err.message : String(err)

const assert = (value, message) => nodeAssert.ok(value, message)

assert.equal = (actual, expected, message) => nodeAssert.equal(actual, expected, message)
assert.deepEqual = (actual, expected, message) => nodeAssert.deepEqual(actual, expected, message)
assert.isTrue = (value, message) => nodeAssert.strictEqual(value, true, message)
assert.isFalse = (value, message) => nodeAssert.strictEqual(value, false, message)
assert.isArray = (value, message) => nodeAssert.ok(Array.isArray(value), message)
assert.lengthOf = (value, expected, message) => nodeAssert.equal(value.length, expected, message)
assert.isFunction = (value, message) => nodeAssert.strictEqual(typeof value, 'function', message)
assert.isUndefined = (value, message) => nodeAssert.strictEqual(value, undefined, message)
assert.isOk = (value, message) => nodeAssert.ok(value, message)
assert.include = (value, expected, message) => {
        if (typeof value === 'string') {
            nodeAssert.ok(value.includes(expected), message)
            return
        }
        if (Array.isArray(value)) {
            nodeAssert.ok(value.includes(expected), message)
            return
        }
        throw new TypeError('assert.include supports only strings and arrays')
    }
assert.property = (object, key, message) => nodeAssert.ok(hasOwn(object, key), message)
assert.notProperty = (object, key, message) => nodeAssert.ok(!hasOwn(object, key), message)
assert.propertyVal = (object, key, expected, message) => {
        nodeAssert.ok(hasOwn(object, key), message)
        nodeAssert.deepEqual(object[key], expected, message)
    }
assert.throws = (fn, expected) => {
        let thrown
        try {
            fn()
        } catch (err) {
            thrown = err
        }

        nodeAssert.ok(thrown, 'expected function to throw')

        if (typeof expected === 'string') {
            nodeAssert.equal(normalizeErrorMessage(thrown), expected)
        } else if (expected instanceof RegExp) {
            nodeAssert.match(normalizeErrorMessage(thrown), expected)
        } else if (typeof expected === 'function') {
            nodeAssert.ok(expected(thrown))
        }

        return thrown
    }
assert.isRejected = async (promise, expected) => {
        let thrown
        try {
            await promise
        } catch (err) {
            thrown = err
        }

        nodeAssert.ok(thrown, 'expected promise to reject')

        if (typeof expected === 'string') {
            nodeAssert.equal(normalizeErrorMessage(thrown), expected)
        } else if (expected instanceof RegExp) {
            nodeAssert.match(normalizeErrorMessage(thrown), expected)
        } else if (typeof expected === 'function') {
            nodeAssert.ok(expected(thrown))
        }
    }
assert.eventually = {
    equal: async (promise, expected, message) => {
        const value = await promise
        nodeAssert.equal(value, expected, message)
    }
}

module.exports = assert

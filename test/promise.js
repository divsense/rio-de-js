const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')

const fromFile = require('../helpers/file-fetcher.js')
const fci = require('../helpers/fetch-compile-install.js')
const { rioLibs, libFunction } = require('../index.js')

chai.use(chaiAsPromised)
const assert = chai.assert

const fetchers = {
    file: fromFile
}

const libUrl = 'file://./examples/promise/delay'

var Rio = rioLibs;

beforeEach(function() {
    return fci(libUrl, Rio, fetchers)
            .then(function(x) { Rio = x });
})

describe('Promise example', function() {
    it('"total1" should return promise', function() {

        const total1 = libFunction(Rio, libUrl, 'total1')

        assert(total1, '"total1" function not found')

        const inputs = [{value: 1}, {value: 2}]

        return assert.eventually.equal(total1(inputs), 3)

    });

    it('"total2" should return promise', function() {

        const total2 = libFunction(Rio, libUrl, 'total2')

        assert(total2, '"total2" function not found')

        const inputs = [{value: 1}, {value: 2}]

        return assert.eventually.equal(total2(inputs), 3)

    });

});



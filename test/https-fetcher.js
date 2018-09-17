const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const rio = require('riojs')

const fetch = require('./fetcher.js')
const fci = require('../helpers/fetch-compile-install.js')
const { rioLibs, libFunction } = require('../rio.de.js')

chai.use(chaiAsPromised)
const assert = chai.assert

const libUrl = 'https://gist.githubusercontent.com/divsense/a064e8d5593fc4ed65bd22e0749faad1/raw/598f357f1256c2f3981255aaf7173bdb65c95756/promise-delay'

describe('Promise example', function() {

    var Rio = rioLibs;

    before(function() {
        return fci(libUrl, Rio, fetch)
                .then(function(x) { Rio = x });
    })

    it('"total1" should return promise', function() {

        this.timeout(10000);

        const total1 = libFunction(Rio, libUrl, 'total1')

        assert(total1, '"total1" function not found')

        const inputs = [{value: 1}, {value: 2}]

        return assert.eventually.equal(total1(inputs), 3)

    });

    it('"total2" should return promise', function() {

        this.timeout(10000);

        const total2 = libFunction(Rio, libUrl, 'total2')

        assert(total2, '"total2" function not found')

        const inputs = [{value: 1}, {value: 2}]

        return assert.eventually.equal(total2(inputs), 3)

    });

});



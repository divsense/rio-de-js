const chai = require('chai')
const rio = require('riojs')
const R = require('ramda')

const fetch = require('./fetcher.js')
const fci = require('../helpers/fetch-compile-install.js')
const { rioLibs, libFunction } = require('../rio.de.js')

const assert = chai.assert

const libUrl = 'mart::parsers/xmld.rio'
const endpoint = 'file://./examples/'

describe('Xmld', function() {

    var Rio = rioLibs;
    var xmld;

    before(function() {
        return fci(libUrl, Rio, fetch, {mart:endpoint}).then(function(x) {
            Rio = x;
            xmld = libFunction(Rio, libUrl, 'xmld');
            assert(xmld, '"xmld" function not found');
        });
    })

    it('should parse attributes', function() {

        //const result = xmld.parse('.node dd foo="bar" sdff ')
        const result = xmld.parse('~ node dd foo="bar" sdff ')

        //console.log(JSON.stringify(result[0], null, 2))


        //assert.deepEqual(result[0], {key:'foo', value:'bar'})

    });

});


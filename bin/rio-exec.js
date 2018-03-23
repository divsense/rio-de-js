const fs = require('fs')
const most = require('most')
const R = require('ramda')
const command = require('commander')
const rio = require('riojs')
const { resolveImports, buildScope, compile, makeLib } = require('../index.js')

const ramda = require('../libs/ramda.js')
const io = require('../libs/io.js')
const math = require('../libs/math.js')
const number = require('../libs/number.js')
const promise = require('../libs/promise.js')

const version = '0.0.1'

const defaultLibs = ['http://divsense.com/ramda']

var srcFileName = ''

command
    .version(version)
    .description('Generate Rio De Js library')
    .option('-b, --body', 'Body code')
    .option('-n, --name [name]', 'Function name')
    .option('-o, --output [dest]', 'Output file name')
    .arguments('<src>')
    .action(function(src) {
        srcFileName = src;
    })
    .parse(process.argv)

const parseLibName = new RegExp('^(\\w+)://(.+)')

const build = function(ast, name) {
    return function(riolibs) {
        const {scope, imports} = buildScope(ast, riolibs, defaultLibs)
        const {code, exports} = compile(ast, imports)

        const lib = makeLib(code, scope, imports, exports)

        return R.assoc(name, lib, riolibs)
    }
}

const fromFile = function(fname) {

    return new Promise((resolve, reject) => {
        fs.readFile(fname, {encoding: 'utf8'}, (err, str) => {
            if(err) {
                reject(err);
            } else {
                resolve(str);
            }
        });
    });
}

const readCode = function(protocol, name) {

    if( protocol === 'file' ) {

        return fromFile(name);

    } else {

        return most.throwError('Lib name: ' + protocol + ' protocol is not supported')

    }

}

const install = function(url, riolibs) {

    const result = parseLibName.exec(url)

    if(result) {
        const protocol = result[1]
        const name = result[2]

        return most.fromPromise( readCode(protocol, name) )
            .chain(rioCode => {

                const ast = rio.parse(rioCode)

                const missingImports = resolveImports(ast, riolibs)

                if(missingImports.length) {

                    const addLibs = most.from(missingImports)
                                        .chain(function(_url) {
                                            return install(_url, riolibs)
                                        })
                                        .reduce(function(_riolibs, _lib) {
                                            return R.merge(_riolibs, _lib)
                                        }, {})

                    return most.fromPromise( addLibs )
                               .map( build(ast, name) )
                } else {
                    return most.of(riolibs).map( build(ast, name) )
                }


            });
    } else {
        return most.throwError('Invalid lib url: ' + url)
    }

}

const rioLibs = {
    'http://divsense.com/ramda': ramda,
    'http://divsense.com/io': io,
    'http://divsense.com/math': math,
    'http://divsense.com/number': number,
    'http://divsense.com/promise': promise
}

const url = 'file://' + srcFileName

install(url, rioLibs)
    .recoverWith(function(err) {
        console.log(err)
        return most.of(rioLibs)
    })
    .observe(function(libs) {

        console.log(libs)

    //const lib = libs[srcFileName]
    //if(lib) {
        //const index = R.indexOf(command.name, lib.names)
        //if(index > -1) {
            //const result = lib.functions[index]()
            //console.log(result)
        //}
    //}


})


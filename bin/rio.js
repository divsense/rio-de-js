#! /usr/bin/env node

const fs = require('fs')
const most = require('most')
const R = require('ramda')
const rio = require('riojs')
const { libFunction, buildScope, msm, install, rioLibs, resolveImports } = require('../index.js')

const argv = require('minimist')(process.argv.slice(2))

if(!argv._.length || argv.help){
    console.log('Usage:')
    console.log('npm run rio <cmd> <path> [name] [-p]')
    console.log('  <cmd>  : view/exec/ast')
    console.log('  <path> : path to rio file without .rio extension')
    console.log('  [name] : name of function to execute')
    console.log('  [-p]   : function returns Promise')
    return
}

const cmd = argv._[0]
const _url = argv._[1]
const name = argv._[2]

if(!_url) {
    console.log('Error: source file name missing');
    return;
}

const url = 'file://' + _url

const fromFile = function(name) {
    const fname = name + '.rio'

    return new Promise((resolve, reject) => {
        fs.readFile(fname, {encoding: 'utf8'}, (err, str) => {
            if(err) {
                console.og('!!!')
                reject(err);
            } else {
                resolve(str);
            }
        });
    });
}

const fetchers = {
    file: fromFile
}

const fetchCode = function(url, fetchers) {

    const parseLibName = new RegExp('^(\\w+)://(.+)')

    const result = parseLibName.exec(url)

    if(result) {
        const protocol = result[1]
        const name = result[2]

        if(fetchers[protocol]) {
            return fetchers[protocol](name)
        } else {
            return Promise.reject('Lib name: ' + protocol + ' protocol is not supported')
        }
    } else {
        return Promise.reject('Invalid url: ' + url)
    }

}

const build = (url, ast) => libs => install(url, ast, libs)

const combine = (url, ast) => libs => ({url:url, ast:ast, libs:libs})

const execFunc = (name, url) => libs => {
    if(libs) {
        const func = libFunction(libs, url, name)
        if(func) {
            try {
                if(argv.p || argv.promise) {
                    func().then(x => {
                        console.log(x)
                    })
                } else {
                    const res = func()
                    console.log(res)
                }
            }
            catch(e) {
                console.log('Error executing ' + name)
                console.log(e)
            }
        } else {
            console.log('Error. ' + url + '::' + name + ' not found')
        }
    }
}

const show = obj => {
  return JSON.stringify(obj, function (k, v) {
    if (typeof v === 'function') {
      return v.toString();
    }
    return v;
  }, 2)
}

const preview = url => libs => {
    if(libs) {
        (libs[url] || []).functions.forEach((fn, index) => {
            console.log(libs[url].names[index] + '::')
            console.log(fn.toString())
            console.log('')
        })
    }
}

const makelib = function(url, riolibs) {

    return most.fromPromise( fetchCode(url, fetchers) )
               .chain(rioCode => {

                const ast = rio.parse(rioCode)
                const missingImports = resolveImports(ast, riolibs)

                if(missingImports.length) {

                    const addLibs = most.from(missingImports)
                                        .chain(function(_url) {
                                            return makelib(_url, riolibs)
                                        })
                                        .reduce(function(_riolibs, _lib) {
                                            return R.merge(_riolibs, _lib)
                                        }, {})

                    return most.fromPromise( addLibs ).map( build(url, ast) )

                } else {

                    return most.of(riolibs).map(build(url, ast))

                }
            });
}

const staticLib = function(url) {
    return most.fromPromise( fetchCode(url, fetchers) )
               .map(rioCode => {
                const ast = rio.parse(rioCode)
                return msm(ast)
               })
}

const showError = function(err) {
    console.log('ERROR.', (err.message || err))
    return most.of({})
}

switch(cmd) {
    case 'exec':
        if(!name) {
            console.log('Error: function name missing');
            return;
        }

        makelib(url, rioLibs)
            .recoverWith(showError)
            .observe(execFunc(name, url))
               .catch(function(e) {
                   console.log(e)
               })


        break;

    case 'static':
        staticLib(url)
            .recoverWith(showError)
            .observe(res => {
                if(res.unresolved.length) {
                    console.error('Unresolved identifiers', res.unresolved)
                    process.exit(1)
                } else {
                    console.log(res.code)
                }
            })

        break;

    case 'lib':
        makelib(url, rioLibs)
            .recoverWith(showError)
            .observe(preview(url))

        break;

    case 'view':
        makelib(url, rioLibs)
            .recoverWith(showError)
            .observe(preview(url))

        break;

    case 'ast':
        most.fromPromise( fetchCode(url, fetchers) )
               .observe(rioCode => {
                   const ast = rio.parse(rioCode)
                   console.log(JSON.stringify(ast, null,2));
               })
        break;

    default:
        console.log('Unknown command "' + cmd + '"')
        return;
}



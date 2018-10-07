// fetch-compile-install.js
// Fetches rio code, then compiles, then installs
//
const R = require('ramda')
const { generate } = require('astring')
const ramdaLib = require('../libs/ramda.js')
const promiseLib = require('../libs/promise.js')
const resolvedImports = require('../src/imported-symbols.js')
const unresolvedIdentifiers = require('../src/unresolved-identifiers.js')

// removeImportDeclarations :: AST -> AST
const removeImportDeclarations = R.over(R.lensProp('body'), R.filter(x => x.type !== 'ImportDeclaration'))

// removeExportDeclarations :: AST -> AST
const removeExportDeclarations = R.over(R.lensProp('body'), R.filter(x => x.type !== 'ReturnStatement'))

// getExports :: AST -> [String]
const getExports = R.compose(
        R.map(R.path(['key', 'name'])),
        R.view(R.lensPath(['argument','properties'])),
        R.find(R.propEq('type', 'ReturnStatement')),
        R.prop('body')
)

// getImports :: AST -> [String]
const getImports = R.compose(
            R.map(x => {
                const source = R.path(['source','value'], x)

                const inames = R.prop('specifiers', x)

                if(!inames) {
                    throw Error("Import: no specifiers for '" + source + "'" )
                }

                const names = R.map(x => {
                    const iname = R.path(['imported', 'name'], x)
                    const lname = R.path(['local', 'name'], x)

                    const name = lname ? iname + ':' + lname : iname

                    return name

                }, R.prop('specifiers', x))

                return {source, names}

            }),
            R.filter(R.propEq('type', 'ImportDeclaration')),
            R.prop('body')
)

// msm :: AST -> String
const msm = ast => {

    const body = R.compose(
        generate,
        removeImportDeclarations,
        removeExportDeclarations
    )( ast )

    const imp = resolvedImports(ast)

    const symbols = unresolvedIdentifiers(imp, ast)
    const names = R.map(R.prop('name'), symbols)

    const ramdaNames = R.intersection(names, ramdaLib.names)
    const promiseNames = R.intersection(names, ramdaLib.names)


    const unresolved = R.map(name => R.find(R.propEq('name', name), symbols), R.difference(names, ramdaNames))
    const ramdaSource = ramdaNames.length ? [{source: 'ramda', names: ramdaNames}] : []

    const CR = R.join('\n')
    const SC = R.join(';')

    const allImports = R.concat(ramdaSource, getImports(ast))

    const imports = R.map(x => 'const {' + R.join(',', x.names) + '} = require(\'' + x.source + '\')', allImports)
    const exports = R.map(x => 'exports.' + x + '=' + x, getExports(ast))

    const promises = [
        'const promiseResolve = Promise.resolve.bind(Promise)',
        'const promiseReject = Promise.reject.bind(Promise)',
        'const promiseAll = Promise.all.bind(Promise)',
        'const promiseRace = Promise.race.bind(Promise)'
    ]

    return {code: CR([SC(promises), CR(imports), body, CR(exports)]), unresolved}

}

module.exports = msm


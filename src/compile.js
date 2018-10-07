const { generate } = require('astring')
const { difference, keys, isEmpty, assoc, test, indexOf, set, is, values, prop
        , concat, dropLast, last, reduce, over, append, nth, lensProp, findIndex
        , remove, lensPath, view, find, compose, filter, map, has
        , path, propEq, unless, isNil } = require('ramda')

const unresolvedIdentifiers = require('./unresolved-identifiers.js')

// resolveIdentifiers :: [String] -> AST -> AST
const resolveIdentifiers = imports => ast => {

    const unresolved = unresolvedIdentifiers(imports, ast)

    if( !isEmpty(unresolved) ) {
        throw({
            message: 'Unknown symbol: ' 
                        + unresolved.name
                        + ' (line: ' + unresolved.loc.start.line
                        + ', column: ' + unresolved.loc.start.column + ')'
        })
    }

    return ast
}

// removeImportDeclarations :: AST -> AST
const removeImportDeclarations = over(lensProp('body'), filter(x => x.type !== 'ImportDeclaration'))

// relocateExports :: AST -> AST
const relocateExports = ast => {

    const ix = filter(propEq('type', 'ReturnStatement'), ast.body)

    if(ix.length === 1) {
        const index = findIndex(propEq('type', 'ReturnStatement'), ast.body)
        return over(lensProp('body'), body => {
            const a = nth(index, body)
            return append(a, remove(index, 1, body))
        }, ast)

    } else if(ix.length === 0) {
        throw {message: 'No exports found'}
    } else {
        throw {message: 'Unexpected "return" statement'}
    }

}

// getExportedIdentifiers :: AST -> AST
const getExportedIdentifiers = ast => {

    const xs = view(lensPath(['argument','properties']), find(propEq('type', 'ReturnStatement'), ast.body))

    if(xs) {
        return map(path(['key', 'name']), xs)
    } else {
        throw {message: 'No exports found'}
    }
}

// compile :: (AST, [String]) -> AST
module.exports = function(ast, imports) {
    const code = compose(
        generate,
        resolveIdentifiers(imports),
        removeImportDeclarations,
        relocateExports)( ast )

    const exports = getExportedIdentifiers(ast)

    return {code, exports}

}


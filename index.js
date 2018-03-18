const fs = require('fs') //!!
const { assoc, lensPath, find, flatten ,update, view, has, propEq, length, filter, nth, remove, findIndex, equals, is, prop, values, indexOf, path, concat, reduce, map, compose, set, lensProp, over, append, last, dropLast  } = require('ramda')
const { generate } = require('astring')
const rio = require('./rio.js')

const setScope = set(lensProp('scope'))
const setResult = set(lensProp('result'))
const mapInit = map(prop('init'))

const verifyId = (scope, name) => {
    if(scope.length === 0) {
        return name
    }

    const local = last(scope)

    if(indexOf(name, local) > -1) {
        return null
    }

    return verifyId(dropLast(1, scope), name)
}

const findUnresolvedDeclaration = (state, node) => {
    if(state.result) {
        return state
    }

    if(node.type === 'FunctionExpression') {
        const _state = over(lensProp('scope'), append(map(prop('name'), node.params)), state)
        const s = reduce(findUnresolvedDeclaration, _state, node.body.body || [])
        return setScope(state.scope, s)

    } else if(node.type === 'VariableDeclaration') {
        const ids = map(path(['id','name']), node.declarations || [])
        const curr = last(state.scope)
        const scope = append(concat(ids, curr), dropLast(1, state.scope))

        const inits = mapInit(node.declarations)

        return reduce(findUnresolvedDeclaration, setScope(scope, state), inits)

    } else if(node.type === 'MemberExpression') {

        return reduce(findUnresolvedDeclaration, state, [node.object])

    } else if(node.type === 'ObjectExpression') {

        return reduce(findUnresolvedDeclaration, state, map(prop('value'), node.properties))

    } else if(node.type === 'Identifier') {

        return setResult(verifyId(state.scope, node.name), state)

    } else if(Array.isArray(node)) {

        return reduce(findUnresolvedDeclaration, state, node)

    } else if(is(Object, node)) {

        return reduce(findUnresolvedDeclaration, state, values(node))

    } 

    return state
}

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

// excludeNames :: ([Spec], Lib) -> Lib
const excludeNames = (specs, lib) => reduce((m,x) => {
    if(x.imported) {
        const index = indexOf(x.imported.name, lib.names)
        if(index > -1){
            if(x.local ){
                return over(lensProp('names'), update(index, x.local.name), m)
            } else {
                return compose(
                    over(lensProp('names'), remove(index, 1)),
                    over(lensProp('functions'), remove(index, 1))
                ) ( m )
            }
        } else {
            throw {message: ('Imported function not found: ' + x.imported.name)}
        }
    } else {
        throw {message: 'Invalid Import Specifier'}
    }

}, lib, specs)

// includeNames :: ([Spec], Lib) -> Lib
const includeNames = (specs, lib) => reduce((m,x) => {
    if(x.imported) {
        const index = indexOf(x.imported.name, lib.names)
        if(index > -1){
            return compose(
                over(lensProp('names'), append( x.local ? x.local.name : x.imported.name)),
                over(lensProp('functions'), append(lib.functions[index]))
            ) ( m )
        } else {
            throw {message: ('Imported function not found: ' + x.imported.name)}
        }
    } else {
        throw {message: 'Invalid Import Specifier'}
    }

}, {names:[], functions:[]}, specs)

// buildLibScope :: ([Declaration], Libs) -> [Lib]
const buildLibScope = (xs, libs) => reduce((m,a) => {
    const lib = view(lensProp(a.source.value), libs)
    if(lib) {
        if(a.specifiers) {
            if(a.exclusive) {
                return append(excludeNames(a.specifiers, lib), m)
            } else {
                return append(includeNames(a.specifiers, lib), m)
            }
        } else {
            return append(lib, m)
        }
    }
    return m
}, [], xs)

// removeImportDeclarations :: AST -> AST
const removeImportDeclarations = over(lensProp('body'), filter(x => x.type !== 'ImportDeclaration'))

// resolveIdentifiers :: [String] -> AST -> AST
const resolveIdentifiers = scopeNames => ast => {

    const state = { scope: [scopeNames], result: null }

    const unresolved = reduce(findUnresolvedDeclaration, state, ast.body)

    if( unresolved.result !== null ) {
        throw({message: 'unresolved symbol: ' + unresolved.result})
    }

    return ast
}

const getExportedIdentifiers = ast => {

    const xs = view(lensPath(['argument','properties']), find(propEq('type', 'ReturnStatement'), ast.body))

    if(xs) {
        return map(path(['key', 'name']), xs)
    } else {
        throw {message: 'No exports found'}
    }
}

// parse :: String -> [AST, Error?]
exports.parse = function(code) {
    try {
        return [ rio.parse(code) ]
    } catch(e) {
        return [null, {
            message: 'Syntax error:' + e.message,
            details: !e.location ? '' : 'At line: ' + e.location.start.line + ' column: ' + e.location.start.column
        }]
    }
}

// resolveLibs :: (AST, RioLibs) -> [URL]
exports.resolveLibs = (ast, riolibs) => compose(
            filter(x => !has(x, riolibs)),
            map(path(['source','value'])),
            filter(propEq('type', 'ImportDeclaration')))( ast.body )

// compile :: (Ast, [String], CoreLibs, RioLibs) -> {libScope, imports}
exports.buildLibScope = function(ast, riolibs, default_lib_urls) {

    const impdecs = filter(propEq('type', 'ImportDeclaration'), ast.body)

    const defs = reduce( (m,a) => {
        const url = path(['source', 'value'], a)
        const index = indexOf(url, default_lib_urls)
        if( index > -1 ) {
            return remove(index, 1, m)
        }
        return m
    }, default_lib_urls, impdecs)

    const impdecs_ = !defs.length ? impdecs : reduce((m,a) => {
		const dec = {
			type: "ImportDeclaration",
			source: {
				type: "Literal",
				value: a
			}
		}
        return append(dec, m)
    }, impdecs, defs)

    const libScope = buildLibScope(impdecs_, riolibs)

    const scopeNames = flatten(map(prop('names'), libScope))

    return {libScope, imports:scopeNames}
}

// compile :: (Ast, [String], CoreLibs, RioLibs) -> [String, Error?]
exports.compile = function(ast, imports) {
    try {
        const code = compose(
          generate,
          resolveIdentifiers(imports),
          removeImportDeclarations,
          relocateExports)( ast )

        const exports = getExportedIdentifiers(ast)

        return {code, exports}

    } catch(e) {

        return {
            error: 'Compile error:' + e.message,
            details: !e.location ? '' : 'At line: ' + e.location.start.line + ' column: ' + e.location.start.column
        }
    }
}

// makeLib :: (String, LibScope, [String], [String]) -> {lib/error}
exports.makeLib = function(code, libScope, imports, exports) {

    try {

        const flib = new Function(imports.join(','), code)

        const scopeArgs = flatten(map(prop('functions'), libScope))

        const funcs = flib.apply(null, scopeArgs)

        const lib = {
            names: exports,
            functions: map(x => funcs[x], exports)
        }

        return {lib}

    } catch(e) {

        return {
            error: 'Making lib error:' + e.message,
            details: !e.location ? '' : 'At line: ' + e.location.start.line + ' column: ' + e.location.start.column
        }
    }

}


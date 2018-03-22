const { generate } = require('astring')
const { test, indexOf, set, is, values, prop, concat, dropLast, last, reduce, over, append, nth, lensProp, findIndex, remove, lensPath, view, find, compose, filter, map, has, path, propEq } = require('ramda')

const setScope = set(lensProp('scope'))
const setResult = set(lensProp('result'))
const mapInit = map(prop('init'))

// verifyId :: (Scope, String) -> String
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

const addFunctionParams = params => scope => reduce((m,p) => {

    if(p.type === 'ObjectPattern') {

        return append(map(path(['key','name']), p.properties), m)

    } else if(p.type === 'ArrayPattern') {

        return append(map(prop('name'), p.elements), m)

    } else {
        return append(prop('name', p), m)
    }

}, scope, params)

// findUnresolvedDeclaration :: (State, Node) -> State
const findUnresolvedDeclaration = (state, node) => {
    if(state.result) {
        return state
    }

    if(node.type === 'ArrowFunctionExpression') {
        const _state = over(lensProp('scope'), addFunctionParams(node.params), state)

        const s = (node.body.type === 'BlockStatement')
                    ? reduce(findUnresolvedDeclaration, _state, node.body.body)
                    : findUnresolvedDeclaration(_state, node.body)

        return setScope(state.scope, s)

    } else if(node.type === 'VariableDeclaration') {
        //const ids = map(path(['id','name']), node.declarations || [])

        const ids = reduce((m,a) => {
            if(path(['id','type'], a) === 'ArrayPattern' ) {

                return concat(m, map(prop('name'), a.id.elements))

            } else if(path(['id','type'], a) === 'ObjectPattern' ) {

                return concat(m, map(path(['key','name']), a.id.properties))

            } else {

                return append(path(['id','name'], a), m)

            }

        }, [], node.declarations || [])

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

// resolveIdentifiers :: [String] -> AST -> AST
const resolveIdentifiers = scopeNames => ast => {

    const state = { scope: [scopeNames], result: null }

    const unresolved = reduce(findUnresolvedDeclaration, state, ast.body)

    if( unresolved.result !== null ) {
        throw({message: 'Unresolved symbol: ' + unresolved.result})
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

// resolveIdentifiers :: (AST, [String]) -> AST
module.exports = function(ast, imports) {
    const code = compose(
        generate,
        resolveIdentifiers(imports),
        removeImportDeclarations,
        relocateExports)( ast )

    const exports = getExportedIdentifiers(ast)

    return {code, exports}

}


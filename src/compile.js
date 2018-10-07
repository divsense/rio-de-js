const { generate } = require('astring')
const { difference, keys, isEmpty, assoc, test, indexOf, set, is, values, prop
        , concat, dropLast, last, reduce, over, append, nth, lensProp, findIndex
        , remove, lensPath, view, find, compose, filter, map, has
        , path, propEq, unless, isNil } = require('ramda')

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

// functionParam :: ([String], Param) -> [String]
const functionParam = (m, p) => {

    if(p.type === 'ObjectPattern') {

        return concat(map(path(['key','name']), p.properties), m)

    } else if(p.type === 'ArrayPattern') {

        return concat(map(prop('name'), p.elements), m)

    } else if(p.type === 'AssignmentPattern') {

        return append(path(['left','name'], p), m)

    } else {
        return append(prop('name', p), m)
    }

}

// updateLastScope :: ([String], State) -> Scope
const updateLastScope = (ids, state) => {
    const curr = last(state.scope)
    return append(concat(ids, curr), dropLast(1, state.scope))
}

const addSymbols = ids => over(lensProp('symbols'), concat(ids))

// buildScopeHierarchy :: (State, Node) -> State
const buildScopeHierarchy = (state, node) => {

    if(!node) {
        return state
    }

    if(node.type === 'FunctionDeclaration') {

        // create new inner state
        const instate = {
            symbols: reduce(functionParam, [], node.params),
            use:{},
            scopes:[]
        }

        const _instate = reduce(buildScopeHierarchy, instate, node.body.body)

        // update upper scope symbols
        const _state = addSymbols([node.id.name])( state )

        return over(lensProp('scopes'), append(_instate), _state)

    } else if(node.type === 'ArrowFunctionExpression') {

        const instate = {
            symbols: reduce(functionParam, [], node.params),
            use:{},
            scopes:[]
        }

        const _instate = (node.body.type === 'BlockStatement')
                    ? reduce(buildScopeHierarchy, instate, node.body.body)
                    : buildScopeHierarchy(instate, node.body)


        return over(lensProp('scopes'), append(_instate), state)

    } else if(node.type === 'VariableDeclaration') {
        const ids = reduce((m,a) => {
            if(path(['id','type'], a) === 'ArrayPattern' ) {
                return concat(m, map(prop('name'), a.id.elements))
            } else if(path(['id','type'], a) === 'ObjectPattern' ) {
                return concat(m, map(path(['key','name']), a.id.properties))
            } else {
                return append(path(['id','name'], a), m)
            }
        }, [], node.declarations || [])

        const inits = mapInit(node.declarations)

        const _state = addSymbols(ids)( state )

        return reduce(buildScopeHierarchy, _state, inits)

    } else if(node.type === 'MemberExpression') {

        return reduce(buildScopeHierarchy, state, [node.object])

    } else if(node.type === 'ObjectExpression' || node.type === 'ObjectPattern') {

        return reduce(buildScopeHierarchy, state, map(prop('value'), node.properties))

    } else if(node.type === 'Identifier') {

        return over(lensProp('use'), assoc(node.name, node.loc), state)

    } else if(Array.isArray(node)) {

        return reduce(buildScopeHierarchy, state, node)

    } else if(is(Object, node)) {

        return reduce(buildScopeHierarchy, state, values(node))

    } 

    return state
}

// findUnresolved :: [Identifier] -> ({Identifier:Location}, Scope) -> {Identifier:Location}
const findUnresolved = symbols => (m, instate) => {
    if( isEmpty(m) ) {

        const _symbols = concat(instate.symbols, symbols)

        if( !isEmpty(instate.use) ) {
            const x = difference(keys(instate.use), _symbols)
            if(!isEmpty(x)) {
                return {
                    name: x[0],
                    loc: instate.use[x[0]]
                }
            }
        }

        if( !isEmpty(instate.scopes) ) {
            return reduce(findUnresolved(_symbols), m, instate.scopes)
        }
    }

    return m
}

// resolveIdentifiers :: [String] -> AST -> AST
const resolveIdentifiers = imports => ast => {

    const state = reduce(buildScopeHierarchy, {symbols: imports, use:{}, scopes:[]}, ast.body)

    const unresolved = reduce(findUnresolved(state.symbols), {}, [state])

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


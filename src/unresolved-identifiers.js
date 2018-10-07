const { difference, keys, isEmpty, assoc, test, indexOf, set, is, values, prop
        , concat, dropLast, last, reduce, over, append, nth, lensProp, findIndex
        , remove, lensPath, view, find, compose, filter, map, has, uniq
        , path, propEq, unless, isNil } = require('ramda')

const mapInit = map(prop('init'))

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

// identifiers :: [String] -> AST -> State
const identifiers = imports => compose(reduce(buildScopeHierarchy, {symbols: imports, use:{}, scopes:[]}), prop('body'))

// fromUse :: (Result, [String], State) -> Result::{Identifier:Location}
const fromUse = (result, symbols, state) => {
    if( !isEmpty(state.use) ) {
        const xs = difference(keys(state.use), symbols)
        if(!isEmpty(xs)) {
            return uniq(concat(map(x => ({name: x, loc: state.use[x]}), xs), result))
        }
    }
    return result
}

// findUnresolved :: [Identifier] -> ({Identifier:Location}, Scope) -> {Identifier:Location}
const findUnresolved = symbols => (m, instate) => {

    const _symbols = concat(instate.symbols, symbols)

    const _m = fromUse(m, _symbols, instate)

    if( !isEmpty(instate.scopes) ) {
        return reduce(findUnresolved(_symbols), _m, instate.scopes)
    }

    return _m
}

const unresolvedIdentifiers = (imports, ast) => {
    const state = identifiers(imports)(ast)
    return reduce(findUnresolved(state.symbols), [], [state])
}

module.exports = unresolvedIdentifiers


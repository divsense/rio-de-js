const { compose, concat, always, ifElse, flatten, filter, map, has, path, propEq } = require('ramda')

const local = ifElse(has('local'), path(['local', 'name']), always([]))

const toSymbolsInUse = x => concat([path(['imported', 'name'], x)], [local(x)])

module.exports = function(ast) {
    return compose(
            flatten,
            map(toSymbolsInUse),
            flatten,
            map(path(['specifiers'])),
            filter(propEq('type', 'ImportDeclaration')))( ast.body )
}


const { compose, filter, map, has, path, propEq } = require('ramda')

module.exports = function(ast, riolibs) {
    return compose(
            filter(x => !has(x, riolibs)),
            map(path(['source','value'])),
            filter(propEq('ImportDeclaration', 'type')))( ast.body )
}

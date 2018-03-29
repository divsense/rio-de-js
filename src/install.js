const R = require('ramda')
const buildScope = require('./build-scope.js')
const compile = require('./compile.js')
const makeLib = require('./make-lib.js')

// install :: (String, AST, RioLibs) -> RioLibs
module.exports = function (name, ast, riolibs) {
    const {scope, imports} = buildScope(ast, riolibs)

    const {code, exports} = compile(ast, imports)

    const lib = makeLib(code, scope, imports, exports)

    return R.assoc(name, lib, riolibs)
}


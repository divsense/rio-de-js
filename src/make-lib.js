const R = require('ramda')

module.exports = function(code, libScope, imports, exports) {

    const flib = new Function(imports.join(','), code)

    const scopeArgs = R.flatten(R.map(R.prop('functions'), libScope))

    const funcs = flib.apply(null, scopeArgs)

    return {
        names: exports,
        functions: R.map(x => funcs[x], exports)
    }

}



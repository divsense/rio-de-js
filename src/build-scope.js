const { reduce, indexOf, remove, append, flatten, prop, compose, filter, map, has, path, propEq } = require('ramda')

// buildScope :: ([Declaration], Libs) -> [Lib]
const buildScope = (xs, libs) => reduce((m,a) => {
    const lib = prop(a.source.value, libs)
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

module.exports = function(ast, riolibs, default_lib_urls) {

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

    const scope = buildScope(impdecs_, riolibs)

    const scopeNames = flatten(map(prop('names'), scope))

    return {scope, imports:scopeNames}
}


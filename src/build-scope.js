const { over, lensProp, reduce, indexOf, remove, append, flatten, prop, compose, filter, map, has, path, propEq } = require('ramda')

const defaultLibs = ['http://divsense.com/ramda']

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

module.exports = function(ast, riolibs) {

    const impdecs = filter(propEq('type', 'ImportDeclaration'), ast.body)

    const defs = reduce( (m,a) => {
        const url = path(['source', 'value'], a)
        const index = indexOf(url, defaultLibs)
        if( index > -1 ) {
            return remove(index, 1, m)
        }
        return m
    }, defaultLibs, impdecs)

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


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



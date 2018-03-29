module.exports = {
    rioLibs : require('./src/rio-libs.js'),
    buildScope : require('./src/build-scope.js'),
    resolveImports : require('./src/resolve-imports.js'),
    compile : require('./src/compile.js'),
    makeLib : require('./src/make-lib.js'),
    install : require('./src/install.js'),
    libFunction : require('./src/lib-function.js'),
    fci : require('./helpers/fetch-compile-install.js'),
    httpFetcher : require('./helpers/http-fetcher.js')
}


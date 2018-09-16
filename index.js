//export { default as rioLibs } from './src/rio-libs-es'
//export { default as install  } from './src/install.js'
//export { default as libFunction  } from './src/lib-function.js'
//export { default as fci  } from './helpers/fetch-compile-install.js'
//export { default as httpFetcher  } from './helpers/http-fetcher.js'

const { rioLibs } = require('./src/rio-libs-es')
const { install  } = require('./src/install.js')
const { libFunction  } = require('./src/lib-function.js')
const { fci  } = require('./helpers/fetch-compile-install.js')

module.exports = {
    rioLibs,
    install,
    libFunction,
    fci
}

